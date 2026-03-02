# Requirements Document: LexiLearn Platform

## Introduction

LexiLearn is a comprehensive dyslexia-first learning platform designed to support students with dyslexia and other learning disabilities through AI-powered text processing, personalized reading experiences, and data-driven analytics. The platform serves four distinct user roles: Students, Teachers, Parents, and Administrators, each with tailored interfaces and functionality.

The system integrates Amazon Bedrock (Claude 3) as the primary AI provider with Google Gemini as a fallback, providing text simplification, quiz generation, and RAG-based question answering. The platform tracks reading sessions, analyzes student performance, identifies at-risk students, and provides actionable insights to educators and parents.

## Glossary

- **System**: The LexiLearn platform (frontend + backend + AI services)
- **User**: Any authenticated person using the platform (Student, Teacher, Parent, or Admin)
- **Student**: A learner with dyslexia or learning disabilities using the platform
- **Teacher**: An educator managing students and assignments
- **Parent**: A guardian monitoring their child's progress
- **Admin**: A system administrator with full access
- **Reading_Session**: A tracked period where a student reads and interacts with text
- **Fatigue_Score**: A calculated metric (0-1) indicating student reading fatigue
- **Comprehension_Score**: A percentage indicating student understanding
- **AI_Service**: Amazon Bedrock or Google Gemini AI provider
- **RAG**: Retrieval-Augmented Generation for context-based question answering
- **JWT**: JSON Web Token for authentication
- **Profile**: Role-specific user data (StudentProfile, TeacherProfile, ParentProfile)
- **At_Risk_Student**: A student identified as needing additional support based on metrics

## Requirements

### Requirement 1: User Authentication and Authorization

**User Story:** As a user, I want to securely register and log in with role-based access, so that I can access features appropriate to my role.

#### Acceptance Criteria

1. WHEN a user registers, THE System SHALL create a user account with email, hashed password, full name, and selected role
2. WHEN a user registers with a role, THE System SHALL create the corresponding profile (StudentProfile, TeacherProfile, or ParentProfile)
3. WHEN a user logs in with valid credentials, THE System SHALL generate a JWT token with 7-day expiration
4. WHEN a user logs in, THE System SHALL return the access token, token type, and user object
5. IF a user provides incorrect credentials, THEN THE System SHALL return an error message
6. IF a user attempts to register with an existing email, THEN THE System SHALL return an error message
7. WHEN an authenticated user requests their profile, THE System SHALL return their current user data
8. WHEN a user accesses a protected route, THE System SHALL verify the JWT token
9. IF a JWT token is invalid or expired, THEN THE System SHALL deny access and return an authentication error
10. WHEN a user accesses a role-specific route, THE System SHALL verify the user has the required role

### Requirement 2: Student Profile Management

**User Story:** As a student, I want to maintain my learning profile, so that the system can personalize my experience.

#### Acceptance Criteria

1. WHEN a student account is created, THE System SHALL initialize a StudentProfile with user_id
2. THE StudentProfile SHALL store grade_level, reading_level, and learning_disability_type
3. WHEN a student updates their profile, THE System SHALL persist the changes to the database
4. THE StudentProfile SHALL support linking to a teacher_id and parent_id
5. THE StudentProfile SHALL maintain relationships to LearningSession and QuizResult records

### Requirement 3: AI-Powered Text Simplification

**User Story:** As a student, I want to simplify complex text to my reading level, so that I can understand difficult content.

#### Acceptance Criteria

1. WHEN a student requests text simplification, THE System SHALL accept text and target grade level
2. THE System SHALL attempt to use Amazon Bedrock (Claude 3) as the primary AI provider
3. IF Bedrock is unavailable, THEN THE System SHALL fall back to Google Gemini
4. THE AI_Service SHALL simplify text using dyslexia-friendly language patterns
5. THE System SHALL return both original and simplified text with the target level
6. WHEN simplification fails, THE System SHALL return an error message
7. THE System SHALL require authentication for text simplification requests

### Requirement 4: AI-Generated Quiz Creation

**User Story:** As a student, I want to generate comprehension quizzes from text, so that I can test my understanding.

#### Acceptance Criteria

1. WHEN a student requests quiz generation, THE System SHALL accept text and number of questions
2. THE System SHALL use Amazon Bedrock to generate multiple-choice questions
3. IF Bedrock is unavailable, THEN THE System SHALL use Google Gemini
4. THE System SHALL return questions in JSON format with id, question, options array, and answer
5. WHEN the AI returns JSON wrapped in code blocks, THE System SHALL extract and parse the JSON
6. THE System SHALL handle quiz generation errors gracefully
7. THE System SHALL require authentication for quiz generation requests

### Requirement 5: RAG-Based Question Answering

**User Story:** As a student, I want to ask questions about text I'm reading, so that I can clarify my understanding.

#### Acceptance Criteria

1. WHEN a student submits a question with context, THE System SHALL accept query and context text
2. THE System SHALL use Amazon Bedrock for RAG-based question answering
3. IF Bedrock is unavailable, THEN THE System SHALL use Google Gemini
4. THE System SHALL structure answers with bullet points and simple language
5. THE System SHALL return answers optimized for dyslexic readers
6. THE System SHALL require authentication for RAG queries

### Requirement 6: PDF Upload and Text Extraction

**User Story:** As a student, I want to upload PDF documents, so that I can read and process them in the platform.

#### Acceptance Criteria

1. WHEN a student uploads a file, THE System SHALL verify it is a PDF
2. IF the file is not a PDF, THEN THE System SHALL return an error
3. THE System SHALL extract text from all pages of the PDF
4. WHERE AWS credentials are configured, THE System SHALL upload the PDF to S3
5. THE System SHALL store files in S3 with path: uploads/{user_id}/{filename}
6. THE System SHALL return the filename, extracted text, and S3 key
7. IF S3 upload fails, THE System SHALL continue with text extraction
8. THE System SHALL require authentication for file uploads

### Requirement 7: Learning Session Tracking

**User Story:** As a student, I want my reading sessions tracked, so that my progress is recorded.

#### Acceptance Criteria

1. WHEN a student starts reading, THE System SHALL create a LearningSession record
2. THE LearningSession SHALL record student_id, content_id, content_type, and start_time
3. WHEN a session is active, THE System SHALL allow updating metrics
4. THE System SHALL store reading_speed, accuracy_score, fatigue_score, and words_per_minute
5. THE System SHALL persist detailed metrics_log as JSON
6. WHEN a session ends, THE System SHALL record end_time
7. THE System SHALL only allow students to access their own sessions
8. WHEN a student requests their sessions, THE System SHALL return paginated results

### Requirement 8: Reading Session Analytics

**User Story:** As a student, I want detailed analytics on my reading sessions, so that I can understand my performance.

#### Acceptance Criteria

1. WHEN analytics are calculated, THE System SHALL accept session_id and metrics array
2. THE System SHALL verify the session belongs to the current student
3. THE System SHALL calculate average reading speed from metrics
4. THE System SHALL calculate average accuracy from metrics
5. THE System SHALL calculate fatigue score using the analytics service
6. THE System SHALL update the session with calculated metrics
7. THE System SHALL identify key bottlenecks based on metrics
8. THE System SHALL suggest appropriate reading level for next session
9. THE System SHALL return comprehensive ReadingSessionAnalytics object

### Requirement 9: Student Performance Summary

**User Story:** As a student, teacher, or parent, I want to view student performance summaries, so that I can track progress.

#### Acceptance Criteria

1. WHEN a summary is requested, THE System SHALL accept student_id
2. IF the user is a student, THE System SHALL only allow viewing their own summary
3. THE System SHALL calculate overall reading level from profile
4. THE System SHALL calculate average accuracy from all sessions
5. THE System SHALL calculate total words read from session data
6. THE System SHALL count mastered vocabulary from quiz results
7. THE System SHALL calculate weekly improvement percentage
8. THE System SHALL identify if student is at risk based on fatigue and accuracy
9. THE System SHALL list risk factors when student is at risk
10. THE System SHALL list student strengths
11. WHEN no session data exists, THE System SHALL return default summary values

### Requirement 10: At-Risk Student Identification

**User Story:** As a teacher, I want to identify students needing support, so that I can provide timely intervention.

#### Acceptance Criteria

1. WHEN calculating student status, THE System SHALL evaluate average comprehension score
2. WHEN calculating student status, THE System SHALL evaluate average fatigue score
3. IF average comprehension is below 60%, THEN THE System SHALL mark student as at risk
4. IF average fatigue is above 0.4, THEN THE System SHALL mark student as at risk
5. THE System SHALL identify specific risk factors (low comprehension, high fatigue, high reread rate)
6. THE System SHALL return risk factors as an array of strings

### Requirement 11: Class-Level Statistics

**User Story:** As a teacher, I want aggregated class statistics, so that I can understand overall class performance.

#### Acceptance Criteria

1. WHEN class stats are requested, THE System SHALL accept class_id and teacher_id
2. THE System SHALL verify the requesting user is a teacher
3. THE System SHALL retrieve all students assigned to the teacher
4. THE System SHALL calculate summary for each student
5. THE System SHALL aggregate average comprehension across all students
6. THE System SHALL count total at-risk students
7. THE System SHALL identify most difficult concepts
8. THE System SHALL count recent activity
9. THE System SHALL return ClassStatistics object with aggregated data

### Requirement 12: Quiz Result Submission

**User Story:** As a student, I want to submit quiz results, so that my comprehension is tracked.

#### Acceptance Criteria

1. WHEN a student submits a quiz, THE System SHALL accept student_id, quiz_title, score, total_questions, and details
2. THE System SHALL create a QuizResult record with completed_at timestamp
3. THE System SHALL store detailed answer breakdown in JSON format
4. THE System SHALL link the result to the student profile
5. THE System SHALL require authentication for quiz submission

### Requirement 13: Concept and Vocabulary Extraction

**User Story:** As a student, I want key concepts extracted from text, so that I can focus on important vocabulary.

#### Acceptance Criteria

1. WHEN concept extraction is requested, THE System SHALL accept text input
2. THE System SHALL identify key concepts from the text
3. THE System SHALL extract vocabulary words with definitions
4. THE System SHALL return concepts array and vocabulary array
5. THE System SHALL require authentication for concept extraction

### Requirement 14: Frontend Role-Based Routing

**User Story:** As a user, I want to access role-appropriate pages, so that I see relevant features.

#### Acceptance Criteria

1. WHEN an unauthenticated user accesses a protected route, THE System SHALL redirect to login
2. WHEN a user accesses a route for a different role, THE System SHALL redirect to their role's dashboard
3. THE System SHALL provide routes for student, teacher, parent, and settings pages
4. THE System SHALL verify user role before rendering protected components
5. THE System SHALL store authentication state in Zustand store
6. THE System SHALL persist user data in localStorage

### Requirement 15: Accessibility Features

**User Story:** As a student with dyslexia, I want accessibility controls, so that I can customize my reading experience.

#### Acceptance Criteria

1. THE System SHALL provide adjustable font size control
2. THE System SHALL provide high contrast mode toggle
3. THE System SHALL provide reading pace adjustment
4. THE System SHALL provide audio toggle for text-to-speech
5. WHEN font size changes, THE System SHALL update CSS custom properties
6. WHEN high contrast is enabled, THE System SHALL apply high-contrast theme
7. THE System SHALL persist accessibility preferences
8. THE System SHALL use Lexend font family for dyslexia-friendly typography

### Requirement 16: Student Dashboard Features

**User Story:** As a student, I want a comprehensive dashboard, so that I can access all learning features.

#### Acceptance Criteria

1. THE System SHALL display student greeting with first name
2. THE System SHALL show quick stats (streak, reading time, words learned, comprehension)
3. THE System SHALL provide tabs for Home, Read, Quiz, Vocabulary, and Progress
4. THE System SHALL display recent texts with session counts
5. THE System SHALL show weekly reading chart
6. THE System SHALL provide text input for reading sessions
7. THE System SHALL support sentence-by-sentence reading navigation
8. THE System SHALL provide AI explanation for current sentence
9. THE System SHALL support text-to-speech with adjustable rate
10. THE System SHALL allow RAG-based questions during reading
11. THE System SHALL track and submit session metrics
12. THE System SHALL generate AI quizzes from text
13. THE System SHALL display vocabulary with mastery progress
14. THE System SHALL show reading accuracy trend charts

### Requirement 17: Teacher Dashboard Features

**User Story:** As a teacher, I want a comprehensive dashboard, so that I can manage students and assignments.

#### Acceptance Criteria

1. THE System SHALL display teacher greeting with name
2. THE System SHALL show key metrics (total students, avg reading level, active assignments, students needing support)
3. THE System SHALL provide tabs for Overview, Students, Assignments, and Messages
4. THE System SHALL highlight at-risk students with alert banner
5. THE System SHALL display class monthly progress chart
6. THE System SHALL show assignment status with completion tracking
7. THE System SHALL provide student search functionality
8. THE System SHALL display student list with level, comprehension, and trend
9. THE System SHALL allow viewing detailed student profiles
10. THE System SHALL show student weekly reading progress charts
11. THE System SHALL support creating new assignments
12. THE System SHALL display assignment completion percentages
13. THE System SHALL provide parent messaging interface

### Requirement 18: Parent Dashboard Features

**User Story:** As a parent, I want to monitor my child's progress, so that I can support their learning.

#### Acceptance Criteria

1. THE System SHALL display parent greeting
2. THE System SHALL show linked student(s) progress
3. THE System SHALL display student reading metrics
4. THE System SHALL show recent activity
5. THE System SHALL provide messaging with teachers
6. THE System SHALL display comprehension trends
7. THE System SHALL highlight areas needing support

### Requirement 19: API Security and CORS

**User Story:** As a system administrator, I want secure API access, so that user data is protected.

#### Acceptance Criteria

1. THE System SHALL enable CORS for cross-origin requests
2. THE System SHALL accept requests from configured origins
3. THE System SHALL allow credentials in CORS requests
4. THE System SHALL support all HTTP methods
5. THE System SHALL support all headers
6. THE System SHALL hash passwords using bcrypt
7. THE System SHALL sign JWT tokens with secret key
8. THE System SHALL validate JWT tokens on protected endpoints
9. THE System SHALL use OAuth2 password flow for login

### Requirement 20: Database Schema and Relationships

**User Story:** As a system administrator, I want a well-structured database, so that data integrity is maintained.

#### Acceptance Criteria

1. THE System SHALL create users table with email, hashed_password, full_name, role, is_active
2. THE System SHALL enforce unique email constraint
3. THE System SHALL create student_profiles table with grade_level, reading_level, learning_disability_type
4. THE System SHALL create teacher_profiles table with school_name and subjects
5. THE System SHALL create parent_profiles table
6. THE System SHALL create learning_sessions table with metrics fields
7. THE System SHALL create quiz_results table with score and details
8. THE System SHALL establish foreign key relationships between tables
9. THE System SHALL use SQLAlchemy ORM for database operations
10. THE System SHALL support SQLite for development and PostgreSQL for production
11. THE System SHALL automatically create tables on application startup

### Requirement 21: Environment Configuration

**User Story:** As a system administrator, I want configurable environment settings, so that I can deploy to different environments.

#### Acceptance Criteria

1. THE System SHALL load configuration from environment variables
2. THE System SHALL support ENVIRONMENT setting (development/production)
3. THE System SHALL configure SECRET_KEY for JWT signing
4. THE System SHALL configure DATABASE_URL for database connection
5. THE System SHALL configure GEMINI_API_KEY for Google AI
6. THE System SHALL configure AWS credentials (ACCESS_KEY_ID, SECRET_ACCESS_KEY, REGION)
7. THE System SHALL configure BEDROCK_MODEL_ID for AI model selection
8. THE System SHALL configure S3_BUCKET_NAME for file storage
9. THE System SHALL provide default values for development
10. THE System SHALL support .env file for local development

### Requirement 22: Deployment and Startup

**User Story:** As a developer, I want easy project startup, so that I can run the application quickly.

#### Acceptance Criteria

1. THE System SHALL provide run_project.bat for Windows startup
2. THE System SHALL provide run_project.sh for Linux/macOS startup
3. THE System SHALL support Docker deployment with Dockerfile
4. THE System SHALL provide AWS deployment guide
5. THE System SHALL install backend dependencies from requirements.txt
6. THE System SHALL install frontend dependencies from package.json
7. THE System SHALL start backend on port 8000
8. THE System SHALL start frontend on port 5173
9. THE System SHALL provide health check endpoint at /api/health
