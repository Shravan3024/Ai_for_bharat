from fastapi import APIRouter
from typing import Dict, Any, List

router = APIRouter()

MOCK_STUDENTS = [
  {
    "id": "s1",
    "name": "Aditi Sharma",
    "email": "aditi@school.com",
    "grade": 5,
    "avatar": None,
    "readingLevel": "Grade 4",
    "weeklyReadingMinutes": 270,
    "vocabularyMastered": 145,
    "comprehensionScore": 72,
    "streak": 5,
    "trend": "improving",
    "avgRereads": 2.3,
    "simplificationLevel": "Level 2",
    "readingSpeed": "85 wpm",
    "lastActive": "2 hours ago",
  },
  {
    "id": "s2",
    "name": "Rohan Patel",
    "email": "rohan@school.com",
    "grade": 5,
    "avatar": None,
    "readingLevel": "Grade 3",
    "weeklyReadingMinutes": 150,
    "vocabularyMastered": 78,
    "comprehensionScore": 54,
    "streak": 2,
    "trend": "needs-support",
    "avgRereads": 4.1,
    "simplificationLevel": "Level 3",
    "readingSpeed": "62 wpm",
    "lastActive": "1 day ago",
  },
  {
    "id": "s3",
    "name": "Sneha Gupta",
    "email": "sneha@school.com",
    "grade": 5,
    "avatar": None,
    "readingLevel": "Grade 5",
    "weeklyReadingMinutes": 340,
    "vocabularyMastered": 210,
    "comprehensionScore": 88,
    "streak": 12,
    "trend": "strong",
    "avgRereads": 1.1,
    "simplificationLevel": "Level 1",
    "readingSpeed": "110 wpm",
    "lastActive": "30 minutes ago",
  },
  {
    "id": "s4",
    "name": "Arjun Kumar",
    "email": "arjun@school.com",
    "grade": 4,
    "avatar": None,
    "readingLevel": "Grade 3",
    "weeklyReadingMinutes": 180,
    "vocabularyMastered": 95,
    "comprehensionScore": 61,
    "streak": 3,
    "trend": "steady",
    "avgRereads": 3.2,
    "simplificationLevel": "Level 2",
    "readingSpeed": "74 wpm",
    "lastActive": "5 hours ago",
  },
  {
    "id": "s5",
    "name": "Priya Reddy",
    "email": "priya@school.com",
    "grade": 5,
    "avatar": None,
    "readingLevel": "Grade 4",
    "weeklyReadingMinutes": 220,
    "vocabularyMastered": 130,
    "comprehensionScore": 68,
    "streak": 7,
    "trend": "improving",
    "avgRereads": 2.8,
    "simplificationLevel": "Level 2",
    "readingSpeed": "78 wpm",
    "lastActive": "1 hour ago",
  },
]

MOCK_ASSIGNMENTS = [
  {
    "id": "a1",
    "title": "The Water Cycle",
    "subject": "Science",
    "difficulty": "Medium",
    "dueDate": "2026-02-10",
    "assignedTo": "Class 5A",
    "submitted": 24,
    "pending": 6,
    "overdue": 2,
    "totalStudents": 32,
    "createdAt": "2026-02-01",
  },
  {
    "id": "a2",
    "title": "Friendly Letter Writing",
    "subject": "English",
    "difficulty": "Easy",
    "dueDate": "2026-02-12",
    "assignedTo": "Class 5A",
    "submitted": 18,
    "pending": 12,
    "overdue": 2,
    "totalStudents": 32,
    "createdAt": "2026-02-03",
  },
]

MOCK_WEEKLY_PROGRESS = [
  { "day": "Mon", "minutes": 35, "words": 12, "score": 70 },
  { "day": "Tue", "minutes": 42, "words": 8, "score": 75 },
  { "day": "Wed", "minutes": 28, "words": 15, "score": 65 },
  { "day": "Thu", "minutes": 50, "words": 10, "score": 80 },
  { "day": "Fri", "minutes": 38, "words": 18, "score": 72 },
  { "day": "Sat", "minutes": 45, "words": 14, "score": 78 },
  { "day": "Sun", "minutes": 32, "words": 9, "score": 68 },
]

MOCK_MONTHLY_PROGRESS = [
  { "week": "Week 1", "readingTime": 180, "vocabulary": 35, "comprehension": 60 },
  { "week": "Week 2", "readingTime": 210, "vocabulary": 48, "comprehension": 65 },
  { "week": "Week 3", "readingTime": 240, "vocabulary": 62, "comprehension": 70 },
  { "week": "Week 4", "readingTime": 270, "vocabulary": 78, "comprehension": 72 },
]

MOCK_QUIZZES = [
  {
    "id": "q1",
    "title": "Water Cycle Quiz",
    "type": "mcq",
    "questions": [
      {
        "id": "q1-1",
        "text": "What happens when water is heated by the sun?",
        "options": ["It freezes", "It evaporates", "It stays the same", "It turns to ice"],
        "correctAnswer": 1,
        "explanation": "When the sun heats water, it turns into water vapor (gas). This is called evaporation.",
      },
      {
        "id": "q1-2",
        "text": "What is condensation?",
        "options": ["Water falling as rain", "Water turning to gas", "Gas turning back to water drops", "Ice melting"],
        "correctAnswer": 2,
        "explanation": "Condensation is when water vapor (gas) cools down and turns back into tiny water drops. This is how clouds form!",
      },
      {
        "id": "q1-3",
        "text": "Which of these is an example of precipitation?",
        "options": ["A puddle drying up", "Rain falling from clouds", "Steam from a kettle", "A river flowing"],
        "correctAnswer": 1,
        "explanation": "Precipitation is any water that falls from clouds - like rain, snow, sleet, or hail.",
      },
    ],
    "totalQuestions": 3,
    "bestScore": 2,
    "attempts": 1,
  },
]

MOCK_MESSAGES = [
  {
    "id": "m1",
    "from": "Mrs. Sharma (Teacher)",
    "fromRole": "teacher",
    "message": "Aditi has been making wonderful progress with her reading this week. She read the Water Cycle chapter with great focus!",
    "timestamp": "2026-02-05T10:30:00",
    "read": True,
  },
  {
    "id": "m2",
    "from": "Mrs. Sharma (Teacher)",
    "fromRole": "teacher",
    "message": "A new assignment on Friendly Letter Writing has been posted. Due date is February 12th.",
    "timestamp": "2026-02-03T14:00:00",
    "read": True,
  },
  {
    "id": "m3",
    "from": "Parent (Aditi's Mom)",
    "fromRole": "parent",
    "message": "Thank you for the update! She has been practicing at home too. Is there anything specific we can help with?",
    "timestamp": "2026-02-05T18:00:00",
    "read": False,
  },
]

@router.get("/teacher")
async def get_teacher_demo_data() -> Dict[str, Any]:
    return {
        "students": MOCK_STUDENTS,
        "assignments": MOCK_ASSIGNMENTS,
        "weeklyProgress": MOCK_WEEKLY_PROGRESS,
        "monthlyProgress": MOCK_MONTHLY_PROGRESS,
        "messages": MOCK_MESSAGES
    }

@router.get("/parent")
async def get_parent_demo_data() -> Dict[str, Any]:
    return {
        "child": MOCK_STUDENTS[0],
        "weeklyProgress": MOCK_WEEKLY_PROGRESS,
        "monthlyProgress": MOCK_MONTHLY_PROGRESS,
        "messages": MOCK_MESSAGES
    }

@router.get("/student/progress")
async def get_student_progress() -> Dict[str, Any]:
    return {
        "weeklyProgress": MOCK_WEEKLY_PROGRESS,
        "quizzes": MOCK_QUIZZES
    }
