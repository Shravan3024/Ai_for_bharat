from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from app.api import deps
from pydantic import BaseModel
from app.core import security, cognito
from app.core.config import settings
from app.core.database import get_db
from app.models import database as models
from app.schemas import schemas

router = APIRouter()

VALID_ROLE_VALUES = {role.value for role in models.UserRole}


def _prepare_user_for_response(db: Session, user: models.User) -> models.User:
    """Normalize legacy user rows so response_model validation does not fail."""
    changed = False

    # Some legacy rows may contain enum repr values or invalid text.
    if user.role not in VALID_ROLE_VALUES:
        user.role = models.UserRole.STUDENT.value
        changed = True

    # Pydantic response model expects a valid email format.
    if not user.email or "@" not in user.email:
        raise HTTPException(status_code=400, detail="Cognito profile does not contain a valid email.")

    if changed:
        db.add(user)
        db.commit()
        db.refresh(user)

    return user

class SyncUserRequest(BaseModel):
    role: models.UserRole
    full_name: str

@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    elif not user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
        "user": user
    }

@router.post("/sync", response_model=schemas.UserSchema)
def sync_cognito_user(
    *,
    db: Session = Depends(get_db),
    sync_req: SyncUserRequest,
    token: str = Depends(deps.reusable_oauth2)
) -> Any:
    """
    Sync a newly registered Amazon Cognito user into the local SQLite DB.
    Validates the token from Cognito first.
    """
    try:
        claims = cognito.verify_cognito_token(token)
        email = claims.get("email")
        if not email:
            username = claims.get("username")
            # Cognito access-token username can be a UUID, not an email.
            # Only use it when it looks like an email to keep schema/DB consistent.
            if username and "@" in username:
                email = username
            
        if not email:
            raise HTTPException(status_code=400, detail="Token missing email claim")
    except Exception as e:
         raise HTTPException(status_code=401, detail=f"Invalid Cognito token: {e}")

    user = db.query(models.User).filter(models.User.email == email).first()
    if user:
        return _prepare_user_for_response(db, user) # Already synced
    
    db_obj = models.User(
        email=email,
        hashed_password="COGNITO_MANAGED", # Password is in Cognito
        full_name=sync_req.full_name,
        role=sync_req.role.value,
        is_active=True,
    )
    db.add(db_obj)
    try:
        db.commit()
        db.refresh(db_obj)
    except IntegrityError:
        db.rollback()
        # Handle race condition where another request inserted the same user.
        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            return existing
        raise HTTPException(status_code=409, detail="User already exists")
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error during user sync: {str(e)}")
    
    return _prepare_user_for_response(db, db_obj)

@router.get("/me", response_model=schemas.UserSchema)
def read_user_me(
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Get current user.
    """
    return current_user
