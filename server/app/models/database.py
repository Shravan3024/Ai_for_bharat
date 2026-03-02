from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, DateTime, Float, JSON, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from app.core.database import Base

class UserRole(str, enum.Enum):
    STUDENT = "student"
    TEACHER = "teacher"
    PARENT = "parent"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(String, default=UserRole.STUDENT)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Profile relationships
    student_profile = relationship("StudentProfile", back_populates="user", uselist=False)
    teacher_profile = relationship("TeacherProfile", back_populates="user", uselist=False)
    parent_profile = relationship("ParentProfile", back_populates="user", uselist=False)

class StudentProfile(Base):
    __tablename__ = "student_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    grade_level = Column(String)
    reading_level = Column(String)
    learning_disability_type = Column(String) # e.g. Dyslexia, ADHD
    teacher_id = Column(Integer, ForeignKey("teacher_profiles.id"), nullable=True)
    parent_id = Column(Integer, ForeignKey("parent_profiles.id"), nullable=True)

    user = relationship("User", back_populates="student_profile")
    sessions = relationship("LearningSession", back_populates="student")
    quiz_results = relationship("QuizResult", back_populates="student")

class TeacherProfile(Base):
    __tablename__ = "teacher_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    school_name = Column(String)
    subjects = Column(JSON) # List of subjects

    user = relationship("User", back_populates="teacher_profile")
    students = relationship("StudentProfile", back_populates="teacher", foreign_keys=[StudentProfile.teacher_id])

class ParentProfile(Base):
    __tablename__ = "parent_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    
    user = relationship("User", back_populates="parent_profile")
    students = relationship("StudentProfile", back_populates="parent", foreign_keys=[StudentProfile.parent_id])

class LearningSession(Base):
    __tablename__ = "learning_sessions"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    content_id = Column(String) # Reference to the text/book
    content_type = Column(String) # e.g. PDF, Text, Web
    
    # Metrics recorded during session
    reading_speed = Column(Float, nullable=True) # WPM
    accuracy_score = Column(Float, nullable=True)
    fatigue_score = Column(Float, nullable=True)
    words_per_minute = Column(Float, nullable=True)
    metrics_log = Column(JSON, nullable=True) # Detailed time-series metrics
    
    student = relationship("StudentProfile", back_populates="sessions")

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("student_profiles.id"))
    quiz_title = Column(String)
    score = Column(Integer)
    total_questions = Column(Integer)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())
    details = Column(JSON) # Detailed breakdown of answers

    student = relationship("StudentProfile", back_populates="quiz_results")
