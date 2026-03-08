from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session
from app.core import security, cognito
from app.core.config import settings
from app.core.database import get_db
from app.models import database as models
from app.schemas import schemas

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login"
)

def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    # Demo token bypass for hackathon judges
    if token and token.startswith("demo-token-"):
        role_map = {
            "demo-token-student": ("aditi@demo.com", "Aditi Sharma", models.UserRole.STUDENT),
            "demo-token-teacher": ("sharma@demo.com", "Mrs. Sharma", models.UserRole.TEACHER),
            "demo-token-parent":  ("priya@demo.com", "Priya Sharma", models.UserRole.PARENT),
        }
        info = role_map.get(token)
        if info:
            email, name, role = info
            user = db.query(models.User).filter(models.User.email == email).first()
            if not user:
                user = models.User(
                    email=email,
                    full_name=name,
                    hashed_password="dummy_hash_for_demo_user",
                    role=role,
                    is_active=True,
                )
                db.add(user)
                db.commit()
                db.refresh(user)
            return user

    try:
        # Verify using Cognito JWKS
        claims = cognito.verify_cognito_token(token)
        
        # Cognito uses 'sub' or 'email' or 'username' depending on token type (id vs access)
        # Typically the 'email' claim is present in the id_token if requested.
        # For this hackathon, we match by email to sync Cognito users to our local SQLite DB.
        email = claims.get("email")
        if not email:
             email = claims.get("username") # Fallback
             
        if not email:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Token does not contain an email or username claim",
            )
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Could not validate credentials: {e}",
        )
        
    user = db.query(models.User).filter(models.User.email == email).first()
    if not user:
        # User exists in Cognito but not locally. The frontend handles this by calling /api/auth/sync
        raise HTTPException(status_code=404, detail="User not found locally. Please sync profile.")
        
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

def get_current_student(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if current_user.role != models.UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="The user is not a student")
    return current_user

def get_current_teacher(
    current_user: models.User = Depends(get_current_active_user),
) -> models.User:
    if current_user.role != models.UserRole.TEACHER:
        raise HTTPException(status_code=403, detail="The user is not a teacher")
    return current_user
