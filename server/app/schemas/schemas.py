from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from app.models.database import UserRole

# Shared properties
class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    role: UserRole = UserRole.STUDENT
    is_active: Optional[bool] = True

# Properties to receive via API on creation
class UserCreate(UserBase):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole

# Properties to receive via API on update
class UserUpdate(UserBase):
    password: Optional[str] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Additional properties to return via API
class UserSchema(UserInDBBase):
    pass

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserSchema

class TokenPayload(BaseModel):
    sub: Optional[int] = None

# Profile schemas
class StudentProfileBase(BaseModel):
    grade_level: Optional[str] = None
    reading_level: Optional[str] = None
    learning_disability_type: Optional[str] = None

class StudentProfileCreate(StudentProfileBase):
    user_id: int

class StudentProfileSchema(StudentProfileBase):
    id: int
    user_id: int
    
    class Config:
        from_attributes = True

# Session schemas
class LearningSessionBase(BaseModel):
    student_id: int
    content_id: Optional[str] = None
    content_type: Optional[str] = None

class LearningSessionCreate(LearningSessionBase):
    pass

class LearningSessionUpdate(BaseModel):
    end_time: Optional[datetime] = None
    reading_speed: Optional[float] = None
    accuracy_score: Optional[float] = None
    fatigue_score: Optional[float] = None
    words_per_minute: Optional[float] = None
    metrics_log: Optional[List[Dict[str, Any]]] = None

class LearningSessionSchema(LearningSessionBase):
    id: int
    start_time: datetime
    end_time: Optional[datetime] = None
    reading_speed: Optional[float] = None
    accuracy_score: Optional[float] = None
    fatigue_score: Optional[float] = None
    words_per_minute: Optional[float] = None
    metrics_log: Optional[List[Dict[str, Any]]] = None

    class Config:
        from_attributes = True

# Quiz schemas
class QuizResultBase(BaseModel):
    student_id: int
    quiz_title: str
    score: int
    total_questions: int
    details: Optional[Dict[str, Any]] = None

class QuizResultCreate(QuizResultBase):
    pass

class QuizResultSchema(QuizResultBase):
    id: int
    completed_at: datetime

    class Config:
        from_attributes = True

# Analytics Request/Response
class AnalyticsSummary(BaseModel):
    student_id: int
    total_sessions: int
    average_score: float
    current_fatigue_level: float
    reading_progress: List[Dict[str, Any]]
    improvement_areas: List[str]
    suggested_level: str
