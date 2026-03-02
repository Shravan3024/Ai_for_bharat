import math
import statistics
from typing import List, Dict, Any
from app.schemas.analytics import ReadingMetric, ReadingSessionAnalytics, StudentPerformanceSummary

class AnalyticsService:
    @staticmethod
    def calculate_fatigue_score(metrics: List[ReadingMetric]) -> float:
        """
        Detects fatigue based on:
        - Decreasing reading speed
        - Increasing reread count
        - Increasing pauses
        - Decreasing accuracy
        """
        if not metrics or len(metrics) < 3:
            return 0.0

        # Simple algorithm: compare first half vs second half
        mid = len(metrics) // 2
        first_half = metrics[:mid]
        second_half = metrics[mid:]

        first_speed = statistics.mean([m.reading_speed_wpm for m in first_half])
        second_speed = statistics.mean([m.reading_speed_wpm for m in second_half])

        speed_drop = max(0, (first_speed - second_speed) / first_speed) if first_speed > 0 else 0

        first_rereads = sum([m.reread_count for m in first_half])
        second_rereads = sum([m.reread_count for m in second_half])
        reread_increase = max(0, (second_rereads - first_rereads) / (first_rereads + 1))

        # Weighting factors
        fatigue_score = (speed_drop * 0.6) + (min(1.0, reread_increase) * 0.4)
        return round(min(1.0, fatigue_score), 2)

    @staticmethod
    def identify_at_risk_factors(student_data: Dict[str, Any]) -> List[str]:
        factors = []
        if student_data.get("avg_comprehension_score", 100) < 60:
            factors.append("Low comprehension accuracy")
        if student_data.get("fatigue_frequency", 0) > 0.4:
            factors.append("High frequency of reading fatigue")
        if student_data.get("reread_rate", 0) > 3.0:
            factors.append("Excessive sentence rereading")
        return factors

    @staticmethod
    def suggest_reading_level(current_level: int, comprehension_score: float) -> int:
        if comprehension_score > 90:
            return current_level + 1
        elif comprehension_score < 60:
            return max(1, current_level - 1)
        return current_level

    @staticmethod
    def aggregate_class_stats(students: List[StudentPerformanceSummary]) -> Dict[str, Any]:
        if not students:
            return {}
            
        avg_comp = statistics.mean([s.avg_accuracy for s in students])
        at_risk = len([s for s in students if s.at_risk])
        total_words = sum([s.total_words_read for s in students])
        
        return {
            "avg_comprehension_score": avg_comp,
            "at_risk_count": at_risk,
            "total_words_read": total_words,
            "avg_weekly_improvement": statistics.mean([s.weekly_improvement_percentage for s in students])
        }

analytics_service = AnalyticsService()
