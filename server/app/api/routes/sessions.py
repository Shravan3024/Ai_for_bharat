from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.core.database import get_db
from app.models import database as models
from app.schemas import schemas

router = APIRouter()

@router.post("/", response_model=schemas.LearningSessionSchema)
def create_session(
    *,
    db: Session = Depends(get_db),
    session_in: schemas.LearningSessionCreate,
    current_user: models.User = Depends(deps.get_current_student),
) -> Any:
    """
    Start a new learning session.
    """
    profile = current_user.student_profile
    if not profile:
        raise HTTPException(status_code=400, detail="Student profile not found")
        
    db_obj = models.LearningSession(
        student_id=profile.id,
        content_id=session_in.content_id,
        content_type=session_in.content_type
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj

@router.put("/{session_id}", response_model=schemas.LearningSessionSchema)
def update_session(
    *,
    db: Session = Depends(get_db),
    session_id: int,
    session_in: schemas.LearningSessionUpdate,
    current_user: models.User = Depends(deps.get_current_student),
) -> Any:
    """
    End/Update session metrics.
    """
    session = db.query(models.LearningSession).filter(
        models.LearningSession.id == session_id,
        models.LearningSession.student_id == current_user.student_profile.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    for field, value in session_in.dict(exclude_unset=True).items():
        setattr(session, field, value)
    
    db.add(session)
    db.commit()
    db.refresh(session)
    return session

@router.get("/me", response_model=List[schemas.LearningSessionSchema])
def read_my_sessions(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_student),
) -> Any:
    """
    Retrieve my learning sessions.
    """
    sessions = db.query(models.LearningSession).filter(
        models.LearningSession.student_id == current_user.student_profile.id
    ).offset(skip).limit(limit).all()
    return sessions
