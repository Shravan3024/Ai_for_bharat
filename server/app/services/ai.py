import json
import boto3
import os
import time
import random
from typing import List, Dict, Any, Optional
from app.core.config import settings
import hashlib

# New google-genai SDK (replaces deprecated google-generativeai)
try:
    from google import genai as google_genai  # type: ignore
    from google.genai import types as genai_types  # type: ignore
    _GEMINI_AVAILABLE = True
except ImportError:
    _GEMINI_AVAILABLE = False


class AIService:
    def __init__(self):
        # Gemini Setup (new SDK: google-genai)
        self.gemini_key = settings.GEMINI_API_KEY or settings.VITE_GEMINI_API_KEY
        self.gemini_client = None
        if self.gemini_key and _GEMINI_AVAILABLE:
            self.gemini_client = google_genai.Client(api_key=self.gemini_key)

        # Bedrock + DynamoDB Setup
        self.bedrock_client = None
        self.dynamodb = None

        args = {"region_name": settings.AWS_REGION}
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            args["aws_access_key_id"] = settings.AWS_ACCESS_KEY_ID
            args["aws_secret_access_key"] = settings.AWS_SECRET_ACCESS_KEY

        # Works both with explicit keys (local) and ECS task role (production)
        if args.get("aws_access_key_id") or os.environ.get("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI"):
            try:
                self.bedrock_client = boto3.client(service_name="bedrock-runtime", **args)
                self.dynamodb = boto3.resource("dynamodb", **args)
            except Exception as e:
                print(f"Failed to initialize AWS clients: {e}")

    # ──────────────────────────────────────────────────────────────────────────
    #  Helpers
    # ──────────────────────────────────────────────────────────────────────────

    def _get_cache_key(self, prompt: str) -> str:
        return hashlib.sha256(prompt.encode()).hexdigest()

    async def _invoke_bedrock(self, prompt: str, system_prompt: Optional[str] = None) -> Optional[str]:
        """
        Invoke Amazon Bedrock Nova Lite with:
          1. DynamoDB cache check first (cost saving — praised in hackathon session)
          2. Exponential backoff retry on ThrottlingException (up to 3 retries)
          3. DynamoDB cache write on success
        """
        cache_key = self._get_cache_key(prompt)

        # 1. Cache check
        if self.dynamodb:
            try:
                table = self.dynamodb.Table(settings.DYNAMODB_CACHE_TABLE)
                response = table.get_item(Key={"prompt_hash": cache_key})
                if "Item" in response:
                    print("AI Cache HIT — skipping Bedrock call")
                    return response["Item"]["response"]
            except Exception as e:
                print(f"DynamoDB cache read error: {e}")

        if not self.bedrock_client:
            return None

        # 2. Invoke with exponential backoff retry
        max_retries = 3
        base_delay = 1.0  # seconds

        for attempt in range(max_retries):
            try:
                response = self.bedrock_client.converse(
                    modelId=settings.BEDROCK_MODEL_ID,
                    messages=[{"role": "user", "content": [{"text": prompt}]}],
                    system=[{"text": system_prompt}] if system_prompt else [],
                )
                response_text = response["output"]["message"]["content"][0]["text"]

                # 3. Save to cache with TTL (7 days)
                if self.dynamodb and response_text:
                    try:
                        table = self.dynamodb.Table(settings.DYNAMODB_CACHE_TABLE)
                        table.put_item(Item={
                            "prompt_hash": cache_key,
                            "response": response_text,
                            "original_prompt": prompt[:100],
                            "ttl": int(time.time()) + (7 * 24 * 3600),  # 7-day TTL
                        })
                    except Exception as e:
                        print(f"DynamoDB cache write error: {e}")

                return response_text

            except Exception as e:
                error_str = str(e)
                is_throttle = "ThrottlingException" in error_str or "Too Many Requests" in error_str
                is_last = attempt == max_retries - 1

                if is_throttle and not is_last:
                    # Exponential backoff with jitter
                    delay = base_delay * (2 ** attempt) + random.uniform(0, 0.5)
                    print(f"Bedrock throttled, retry {attempt + 1}/{max_retries} in {delay:.1f}s")
                    time.sleep(delay)
                else:
                    print(f"Bedrock error (attempt {attempt + 1}): {error_str}")
                    return None

        return None

    async def _invoke_gemini(self, full_prompt: str) -> Optional[str]:
        """Fallback: Call Gemini 1.5 Flash using the new google-genai SDK."""
        if not self.gemini_client:
            return None
        try:
            response = self.gemini_client.models.generate_content(
                model="gemini-1.5-flash",
                contents=full_prompt,
            )
            return response.text
        except Exception as e:
            print(f"Gemini error: {e}")
            return None

    # ──────────────────────────────────────────────────────────────────────────
    #  Public AI methods — each tries Bedrock first, Gemini as fallback
    # ──────────────────────────────────────────────────────────────────────────

    async def simplify_text(self, text: str, level: int) -> str:
        """Simplify text for a dyslexic student using Bedrock → Gemini fallback."""
        system = (
            "You are an expert in dyslexia-friendly writing. "
            "Use simple words, short sentences, and avoid jargon."
        )
        prompt = (
            f"Simplify the following text for a dyslexic student at grade level {level}. "
            f"Use simple words and short sentences.\nText: {text}"
        )

        result = await self._invoke_bedrock(prompt, system)
        if result:
            return result

        result = await self._invoke_gemini(f"System: {system}\nUser: {prompt}")
        if result:
            return result

        return f"Simplified version: {text[:200]}"

    async def generate_quiz(self, text: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        """Generate a comprehension quiz from text."""
        system = "You are an educational assistant. Output only valid JSON."
        prompt = (
            f"Generate a {num_questions}-question multiple choice quiz about the following text. "
            f"Return ONLY JSON with a 'questions' key containing objects with 'id', 'question', "
            f"'options' (array of 4), and 'answer' (the correct option text).\nText: {text}"
        )

        def _parse_quiz(raw: str) -> List[Dict[str, Any]]:
            if "```json" in raw:
                raw = raw.split("```json")[1].split("```")[0].strip()
            elif "```" in raw:
                raw = raw.split("```")[1].split("```")[0].strip()
            return json.loads(raw).get("questions", [])

        raw = await self._invoke_bedrock(prompt, system)
        if raw:
            try:
                return _parse_quiz(raw)
            except Exception:
                pass

        raw = await self._invoke_gemini(f"System: {system}\nUser: {prompt}")
        if raw:
            try:
                return _parse_quiz(raw)
            except Exception as e:
                print(f"Quiz parse error: {e}")

        # Hard mock fallback — demo still works even if both AI providers fail
        return [
            {
                "id": i + 1,
                "question": f"Sample question {i + 1}?",
                "options": ["Option A", "Option B", "Option C", "Option D"],
                "answer": "Option A",
            }
            for i in range(num_questions)
        ]

    async def rag_query(self, query: str, context: str) -> str:
        """RAG workflow: answer a question grounded in provided context."""
        system = (
            "You are a RAG assistant for LexiLearn. "
            "Use bullet points and simple language suitable for dyslexic readers. "
            "Only answer based on the provided context."
        )
        prompt = (
            f"Using the following context, answer the student's question.\n"
            f"Context: {context}\nQuestion: {query}"
        )

        result = await self._invoke_bedrock(prompt, system)
        if result:
            return result

        result = await self._invoke_gemini(f"System: {system}\nUser: {prompt}")
        if result:
            return result

        return "I couldn't find a specific answer in the text. Try rephrasing your question."

    async def chat(self, message: str, history: List[Dict] = None) -> str:
        """LexiBot — general-purpose dyslexia support chat."""
        system = (
            "You are LexiBot, a friendly AI assistant built into LexiLearn — "
            "an app that helps students with dyslexia read and learn better. "
            "Use simple words, short sentences, and be encouraging. "
            "If a student is struggling, suggest breaking down the task into smaller steps."
        )
        context = ""
        if history:
            for h in history[-4:]:  # Last 4 turns for context window
                role = "Student" if h.get("role") == "user" else "LexiBot"
                context += f"{role}: {h.get('content', '')}\n"

        prompt = f"{context}Student: {message}\nLexiBot:"

        result = await self._invoke_bedrock(prompt, system)
        if result:
            return result

        result = await self._invoke_gemini(f"System: {system}\nConversation:\n{prompt}")
        if result:
            return result

        return "Hi! I'm LexiBot. I'm here to help you read and learn. What would you like to know?"


ai_service = AIService()
