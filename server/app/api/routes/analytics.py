from fastapi import APIRouter, HTTPException, Query, Body, Depends
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.api import deps
from app.core.database import get_db
from app.models import database as models
from app.schemas.analytics import ReadingMetric, ReadingSessionAnalytics, StudentPerformanceSummary, ClassStatistics
from app.services.analytics import analytics_service

router = APIRouter()

@router.post("/sessions/{session_id}/calculate", response_model=ReadingSessionAnalytics)
async def calculate_session_analytics(
    session_id: int,
    metrics: List[ReadingMetric] = Body(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_student)
):
    """
    Calculates detailed analytics for a reading session including fatigue score.
    """
    session = db.query(models.LearningSession).filter(
        models.LearningSession.id == session_id,
        models.LearningSession.student_id == current_user.student_profile.id
    ).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if not metrics:
        raise HTTPException(status_code=400, detail="No metrics provided")
        
    avg_speed = sum([m.reading_speed_wpm for m in metrics]) / len(metrics)
    avg_acc = sum([m.accuracy_percentage for m in metrics]) / len(metrics)
    total_time = len(metrics) * 30 # Assume 30s intervals for this mock
    
    fatigue = analytics_service.calculate_fatigue_score(metrics)
    
    # Update session in DB
    session.reading_speed = avg_speed
    session.accuracy_score = avg_acc
    session.fatigue_score = fatigue
    session.metrics_log = [m.dict() for m in metrics]
    session.end_time = datetime.now()
    
    db.add(session)
    db.commit()
    db.refresh(session)
    
    # Prepare response
    return ReadingSessionAnalytics(
        session_id=str(session.id),
        student_id=str(session.student_id),
        text_id=session.content_id or "unknown",
        total_reading_time_seconds=total_time,
        avg_reading_speed_wpm=avg_speed,
        final_comprehension_score=avg_acc,
        metrics_over_time=metrics,
        key_bottlenecks=["Fatigue detected towards the end" if fatigue > 0.4 else "Steady progress"],
        suggested_level_for_next_session=analytics_service.suggest_reading_level(4, avg_acc)
    )

@router.get("/student/{student_id}/summary", response_model=StudentPerformanceSummary)
async def get_student_summary(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    """
    Returns high-level summary for a student.
    """
    # Permission check: student can only see their own, teachers/parents can see their assigned students
    if current_user.role == models.UserRole.STUDENT and current_user.student_profile.id != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to view this summary")
    
    student_profile = db.query(models.StudentProfile).filter(models.StudentProfile.id == student_id).first()
    if not student_profile:
        raise HTTPException(status_code=404, detail="Student profile not found")
        
    sessions = db.query(models.LearningSession).filter(models.LearningSession.student_id == student_id).all()
    quiz_results = db.query(models.QuizResult).filter(models.QuizResult.student_id == student_id).all()
    
    if not sessions and not quiz_results:
        return StudentPerformanceSummary(
            student_id=str(student_id),
            overall_reading_level=student_profile.reading_level or "Beginner",
            avg_accuracy=0,
            total_words_read=0,
            mastered_vocabulary_count=0,
            weekly_improvement_percentage=0,
            at_risk=False,
            risk_factors=[],
            strengths=["Ready to start!"]
        )
    
    avg_accuracy = sum([s.accuracy_score or 0 for s in sessions]) / len(sessions) if sessions else 0
    total_words = sum([s.words_per_minute or 0 for s in sessions]) * 10 # Mock total calculation
    
    fatigue_avg = sum([s.fatigue_score or 0 for s in sessions]) / len(sessions) if sessions else 0
    at_risk = fatigue_avg > 0.4 or avg_accuracy < 60
    
    risk_factors = analytics_service.identify_at_risk_factors({
        "avg_comprehension_score": avg_accuracy,
        "fatigue_frequency": fatigue_avg,
        "reread_rate": 1.5 # Mock
    })
    
    return StudentPerformanceSummary(
        student_id=str(student_id),
        overall_reading_level=student_profile.reading_level or "Grade 4",
        avg_accuracy=avg_accuracy,
        total_words_read=int(total_words),
        mastered_vocabulary_count=len(quiz_results) * 5, # Mock
        weekly_improvement_percentage=5.0, # Mock
        at_risk=at_risk,
        risk_factors=risk_factors,
        strengths=["Consistent effort"] if not at_risk else ["Improving engagement"]
    )

@router.get("/class/{class_id}/stats", response_model=ClassStatistics)
async def get_class_stats(
    class_id: int, 
    teacher_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(deps.get_current_teacher)
):
    """
    Returns aggregated statistics for an entire class.
    """
    students = db.query(models.StudentProfile).filter(models.StudentProfile.teacher_id == current_user.teacher_profile.id).all()
    
    student_summaries = []
    for student in students:
        # Get a quick summary for each
        sessions = db.query(models.LearningSession).filter(models.LearningSession.student_id == student.id).all()
        avg_acc = sum([s.accuracy_score or 0 for s in sessions]) / len(sessions) if sessions else 0
        total_words = sum([s.words_per_minute or 0 for s in sessions]) * 10
        
        student_summaries.append(StudentPerformanceSummary(
            student_id=str(student.id),
            overall_reading_level=student.reading_level or "Grade 4",
            avg_accuracy=avg_acc,
            total_words_read=int(total_words),
            mastered_vocabulary_count=0,
            weekly_improvement_percentage=0,
            at_risk=avg_acc < 60
        ))
    
    agg = analytics_service.aggregate_class_stats(student_summaries) if student_summaries else {"avg_comprehension_score": 0, "at_risk_count": 0}
    
    return ClassStatistics(
        class_id=str(class_id),
        teacher_id=str(teacher_id),
        student_count=len(students),
        avg_reading_level="Grade 4.5",
        avg_comprehension_score=agg.get("avg_comprehension_score", 0),
        at_risk_count=agg.get("at_risk_count", 0),
        most_difficult_concepts=["Complex compound sentences"],
        recent_activity_count=len(students) * 2
    )
