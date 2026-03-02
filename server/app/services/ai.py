import google.generativeai as genai
import json
import boto3
import os
from typing import List, Dict, Any, Optional
from app.core.config import settings

class AIService:
    def __init__(self):
        # Gemini Setup
        self.gemini_key = settings.GEMINI_API_KEY or settings.VITE_GEMINI_API_KEY
        self.gemini_model = None
        if self.gemini_key:
            genai.configure(api_key=self.gemini_key)
            self.gemini_model = genai.GenerativeModel('gemini-1.5-flash')
            
        # Bedrock Setup
        self.bedrock_client = None
        if settings.AWS_ACCESS_KEY_ID and settings.AWS_SECRET_ACCESS_KEY:
            self.bedrock_client = boto3.client(
                service_name="bedrock-runtime",
                region_name=settings.AWS_REGION,
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY
            )
        elif os.environ.get("AWS_CONTAINER_CREDENTIALS_RELATIVE_URI"): # Check if running on AWS
            self.bedrock_client = boto3.client(
                service_name="bedrock-runtime",
                region_name=settings.AWS_REGION
            )

    async def _invoke_bedrock(self, prompt: str, system_prompt: Optional[str] = None) -> str:
        """Helper to invoke Amazon Bedrock (Claude 3)"""
        if not self.bedrock_client:
            return None
            
        messages = [{"role": "user", "content": prompt}]
        
        body = json.dumps({
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 4096,
            "system": system_prompt or "You are a helpful assistant for dyslexic students.",
            "messages": messages
        })
        
        try:
            response = self.bedrock_client.invoke_model(
                modelId=settings.BEDROCK_MODEL_ID,
                body=body
            )
            response_body = json.loads(response.get("body").read())
            return response_body["content"][0]["text"]
        except Exception as e:
            print(f"Bedrock error: {str(e)}")
            return None

    async def simplify_text(self, text: str, level: int) -> str:
        """
        Uses Amazon Bedrock (primary) or Gemini to simplify text.
        """
        prompt = f"Simplify the following text for a dyslexic student at grade level {level}. Use simple words, short sentences, and clear structure. Text: {text}"
        
        # Try AWS Bedrock first
        if self.bedrock_client:
            simplified = await self._invoke_bedrock(
                prompt=prompt,
                system_prompt="You are an expert in dyslexia-friendly writing. Use clear fonts descriptions if needed, but focus on vocabulary and sentence structure simplification."
            )
            if simplified:
                return simplified

        # Fallback to Gemini
        if not self.gemini_model:
            return f"SIMPLIFIED (Mock): {text[:100]}... simplified to level {level}"
            
        try:
            response = await self.gemini_model.generate_content_async(
                f"System: You are an expert in dyslexia-friendly writing. Use clear sentence structure simplification.\nUser: {prompt}"
            )
            return response.text
        except Exception as e:
            return f"Error: {str(e)}"

    async def generate_quiz(self, text: str, num_questions: int = 5) -> List[Dict[str, Any]]:
        """
        Generates a comprehension quiz from text using Amazon Bedrock.
        """
        prompt = f"Generate a {num_questions} question multiple choice quiz about the following text. Return ONLY JSON format with a 'questions' key containing an array of objects with 'id', 'question', 'options' (array), and 'answer'. Text: {text}"
        
        # Try AWS Bedrock
        if self.bedrock_client:
            quiz_str = await self._invoke_bedrock(
                prompt=prompt,
                system_prompt="You are an educational assistant. Output only valid JSON."
            )
            if quiz_str:
                try:
                    # Bedrock/Claude sometimes wraps JSON in code blocks
                    if "```json" in quiz_str:
                        quiz_str = quiz_str.split("```json")[1].split("```")[0].strip()
                    elif "```" in quiz_str:
                        quiz_str = quiz_str.split("```")[1].split("```")[0].strip()
                    return json.loads(quiz_str).get("questions", [])
                except:
                    pass

        # Fallback to Gemini
        if not self.gemini_model:
            return [
                {"id": 1, "question": "Mock question?", "options": ["A", "B", "C", "D"], "answer": "A"}
            ] * num_questions
            
        try:
            response = await self.gemini_model.generate_content_async(
                f"System: You are an educational assistant. Output only valid JSON.\nUser: {prompt}"
            )
            quiz_str = response.text
            # Clean JSON
            if "```json" in quiz_str:
                quiz_str = quiz_str.split("```json")[1].split("```")[0].strip()
            elif "```" in quiz_str:
                quiz_str = quiz_str.split("```")[1].split("```")[0].strip()
            return json.loads(quiz_str).get("questions", [])
        except Exception as e:
            return [{"error": str(e)}]

    async def rag_query(self, query: str, context: str) -> str:
        """
        Implements a RAG workflow using Amazon Bedrock with Gemini fallback.
        """
        prompt = f"Using the following context, answer the student's question in a way that is easy for someone with dyslexia to understand. \nContext: {context}\nQuestion: {query}"
        
        if self.bedrock_client:
            return await self._invoke_bedrock(
                prompt=prompt,
                system_prompt="You are a specialized RAG assistant for LexiLearn. Ensure the output is structured with bullet points and simple language."
            )
        
        # Fallback to Gemini for RAG
        if self.gemini_model:
            try:
                response = await self.gemini_model.generate_content_async(
                    f"System: You are a specialized RAG assistant for LexiLearn. Ensure the output is structured with bullet points and simple language.\nUser: {prompt}"
                )
                return response.text
            except Exception as e:
                return f"Error: {str(e)}"
                
        return "RAG functionality requires AWS Bedrock or Gemini configuration."

ai_service = AIService()
