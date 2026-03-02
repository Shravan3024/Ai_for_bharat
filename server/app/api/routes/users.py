from typing import Any, List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.api import deps
from app.core import security
from app.core.database import get_db
from app.models import database as models
from app.schemas import schemas

router = APIRouter()

@router.get("/", response_model=List[schemas.UserSchema])
def read_users(
    db: Session = Depends(get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Retrieve users. Only for teachers/admin (simplified here for demonstration).
    """
    if current_user.role not in [models.UserRole.TEACHER, models.UserRole.ADMIN]:
        raise HTTPException(status_code=403, detail="Not enough permissions")
    
    users = db.query(models.User).offset(skip).limit(limit).all()
    return users

@router.put("/me", response_model=schemas.UserSchema)
def update_user_me(
    *,
    db: Session = Depends(get_db),
    password: str = None,
    full_name: str = None,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update own user.
    """
    if password:
        current_user.hashed_password = security.get_password_hash(password)
    if full_name:
        current_user.full_name = full_name
    
    db.add(current_user)
    db.commit()
    db.refresh(current_user)
    return current_user

@router.get("/me/profile", response_model=Any)
def read_user_profile_me(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user profile data.
    """
    if current_user.role == models.UserRole.STUDENT:
        return current_user.student_profile
    elif current_user.role == models.UserRole.TEACHER:
        return current_user.teacher_profile
    elif current_user.role == models.UserRole.PARENT:
        return current_user.parent_profile
    return {}

@router.put("/me/student-profile", response_model=schemas.StudentProfileSchema)
def update_student_profile(
    *,
    db: Session = Depends(get_db),
    profile_in: schemas.StudentProfileBase,
    current_user: models.User = Depends(deps.get_current_student),
) -> Any:
    """
    Update student profile.
    """
    profile = current_user.student_profile
    if not profile:
        profile = models.StudentProfile(user_id=current_user.id)
        db.add(profile)
    
    for field, value in profile_in.dict(exclude_unset=True).items():
        setattr(profile, field, value)
    
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
