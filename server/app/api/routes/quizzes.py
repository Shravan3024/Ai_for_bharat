from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.core.database import get_db
from app.models import database as models
from app.schemas import schemas

router = APIRouter()

@router.post("/results", response_model=schemas.QuizResultSchema)
def submit_quiz_result(
    *,
    db: Session = Depends(get_db),
    result_in: schemas.QuizResultCreate,
    current_user: models.User = Depends(deps.get_current_student),
) -> Any:
    """
    Store quiz results.
    """
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found")
        
    db_obj = models.QuizResult(
        student_id=profile.id,
        quiz_title=result_in.quiz_title,
        score=result_in.score,
        total_questions=result_in.total_questions,
        details=result_in.details
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.get("/results/me", response_model=List[schemas.QuizResultSchema])
def read_my_quiz_results(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_student),
) -> Any:
    """
    Retrieve my quiz results.
    """
    results = db.query(models.QuizResult).filter(
        models.QuizResult.student_id == current_user.student_profile.id
    ).offset(skip).limit(limit).all()
    return results
