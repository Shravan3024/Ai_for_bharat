from fastapi import APIRouter, HTTPException, Body, UploadFile, File, Depends
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from app.services.ai import ai_service
from app.api import deps
from app.models import database as models
from app.core.config import settings
import PyPDF2 
import io
import boto3

# Mock Database objects for Hackathon
MOCK_LIBRARY = [
    {
        "id": "t1",
        "title": "The Water Cycle",
        "originalText": "Water moves in a continuous cycle between the Earth's surface and the atmosphere. The sun heats water in oceans, lakes, and rivers, causing it to evaporate into water vapor. This vapor rises into the atmosphere where it cools and condenses into tiny water droplets, forming clouds. When these droplets combine and become heavy enough, they fall back to Earth as precipitation — rain, snow, sleet, or hail. The water then collects in bodies of water or seeps into the ground, and the cycle begins again.",
        "concepts": ["evaporation", "condensation", "precipitation", "water cycle"],
        "readCount": 3,
        "lastRead": "2026-02-05",
    },
    {
        "id": "t2",
        "title": "Friendly Letter",
        "originalText": "A friendly letter is a type of personal letter written to someone you know well, such as a friend or family member. It has five parts: the heading with your address and date, the greeting which says hello, the body where you share your news and thoughts, the closing which says goodbye, and your signature. Unlike formal letters, friendly letters use a warm, casual tone.",
        "concepts": ["heading", "greeting", "body", "closing", "signature"],
        "readCount": 1,
        "lastRead": "2026-02-04",
    }
]

MOCK_VOCAB = [
  {"id": "v1", "word": "Evaporation", "definition": "When water turns into gas from heat", "mastery": 80},
  {"id": "v2", "word": "Condensation", "definition": "When gas turns back into water drops", "mastery": 65},
  {"id": "v3", "word": "Precipitation", "definition": "Rain, snow, or hail falling from clouds", "mastery": 45},
]

router = APIRouter()

@router.get("/library")
async def get_library(current_user: models.User = Depends(deps.get_current_active_user)):
    """Returns the reading library materials."""
    return {"texts": MOCK_LIBRARY, "vocabulary": MOCK_VOCAB}

@router.post("/simplify")
async def simplify_text(
    text: str = Body(...),
    level: int = Body(5),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Simplifies provided text for a specific grade level using Amazon Bedrock.
    """
    simplified = await ai_service.simplify_text(text, level)
    return {"original": text, "simplified": simplified, "level": level}

@router.post("/quiz/generate")
async def generate_quiz(
    text: str = Body(...),
    num_questions: int = Body(5),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Generates a comprehension quiz from text using Bedrock.
    """
    questions = await ai_service.generate_quiz(text, num_questions)
    return {"questions": questions}

@router.post("/rag/query")
async def query_context(
    query: str = Body(...),
    context: str = Body(...),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Answers questions using a context (RAG workflow) via Bedrock.
    """
    answer = await ai_service.rag_query(query, context)
    return {"answer": answer}

@router.post("/upload")
async def upload_file(
    file: UploadFile = File(...),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Uploads a PDF to Amazon S3 (if configured) and extracts text.
    """
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF files are supported")
        
    try:
        content = await file.read()
        
        # Mock S3 Upload if credentials exist
        if settings.AWS_ACCESS_KEY_ID:
            try:
                s3 = boto3.client(
                    's3',
                    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                    region_name=settings.AWS_REGION
                )
                s3.put_object(
                    Bucket=settings.S3_BUCKET_NAME,
                    Key=f"uploads/{current_user.id}/{file.filename}",
                    Body=content
                )
                print(f"File uploaded to S3: {file.filename}")
            except Exception as e:
                print(f"S3 Upload failed (optional): {str(e)}")

        # Extract text for immediate processing
        pdf_file = io.BytesIO(content)
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
            
        return {"filename": file.filename, "text": text, "s3_key": f"uploads/{current_user.id}/{file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error reading PDF: {str(e)}")

@router.post("/concepts")
async def extract_concepts(
    text: str = Body(...),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Extracts key concepts and vocabulary words from text.
    """
    # This would use spaCy in a real app
    # For now, return mock concepts
    return {
        "concepts": ["Concept A", "Concept B"],
        "vocabulary": [
            {"word": "example", "definition": "a representative part of a group"},
            {"word": "lexilearn", "definition": "learning platform for dyslexia"}
        ]
    }

class ChatRequest(BaseModel):
    message: str
    history: Optional[List[Dict[str, str]]] = None

@router.post("/chat")
async def chat_with_ai(
    req: ChatRequest,
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    General-purpose AI chat for dyslexia support. Uses Bedrock/Gemini.
    """
    answer = await ai_service.chat(req.message, req.history or [])
    return {"reply": answer}
