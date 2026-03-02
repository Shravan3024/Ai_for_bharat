from pydantic import BaseModel
from typing import List, Dict, Optional, Any
from datetime import datetime

class ReadingMetric(BaseModel):
    timestamp: datetime
    reading_speed_wpm: float
    accuracy_percentage: float
    simplification_level_requested: int
    reread_count: int
    pauses_detected: int
    fatigue_score: float

class ReadingSessionAnalytics(BaseModel):
    session_id: str
    student_id: str
    text_id: str
    total_reading_time_seconds: int
    avg_reading_speed_wpm: float
    final_comprehension_score: float
    metrics_over_time: List[ReadingMetric]
    key_bottlenecks: List[str]
    suggested_level_for_next_session: int

class StudentPerformanceSummary(BaseModel):
    student_id: str
    overall_reading_level: str
    avg_accuracy: float
    total_words_read: int
    mastered_vocabulary_count: int
    weekly_improvement_percentage: float
    at_risk: bool
    risk_factors: Optional[List[str]] = []
    strengths: List[str] = []

class ClassStatistics(BaseModel):
    class_id: str
    teacher_id: str
    student_count: int
    avg_reading_level: str
    avg_comprehension_score: float
    at_risk_count: int
    most_difficult_concepts: List[str]
    recent_activity_count: int
