# LexiLearn — AI for Bharat Hackathon Submission Script

---

## 📋 Presentation Script (For Slides / Written Submission)

### 1. Problem Statement

**"In India, 35 million children struggle with dyslexia — yet 90% are never diagnosed."**

Dyslexic students face a triple disadvantage:
- Standard textbooks are visually overwhelming — dense text, small fonts, and complex vocabulary cause **cognitive overload**
- Teachers lack tools to identify which students are struggling and **when fatigue sets in**
- Parents are left in the dark with **zero visibility** into their child's daily learning progress

The result? Millions of capable children fall behind — not because they can't learn, but because the system **wasn't designed for how their brain works**.

---

### 2. Our Solution: LexiLearn

**LexiLearn is an AI-powered learning companion built specifically for dyslexic students.**

It doesn't just simplify text — it **adapts in real-time** to each student's reading ability, tracks fatigue, generates personalized quizzes, and gives teachers and parents a live dashboard into the student's journey.

**Three powerful portals, one unified platform:**

| Portal | Who | What It Does |
|---|---|---|
| **Student** | The learner | AI-simplified reading, quizzes, LexiBot chat assistant |
| **Teacher** | The educator | Student analytics, reading speed tracking, assignment management |
| **Parent** | The guardian | Real-time progress reports, weekly trends, communication with teachers |

---

### 3. How AI is the Core (Not a Feature)

> **"Remove the AI, and LexiLearn becomes a plain text reader. The AI IS the product."**

| AI Feature | What It Does | AWS Service |
|---|---|---|
| **Text Simplification** | Rewrites complex passages at the student's reading level | Amazon Bedrock (Nova Lite) |
| **Quiz Generation** | Creates comprehension questions from any reading material | Amazon Bedrock (Nova Lite) |
| **LexiBot Chat** | A conversational AI tutor that explains concepts in simple language | Amazon Bedrock (Nova Lite) |
| **RAG Q&A** | Students upload PDFs and ask questions about the content | Amazon Bedrock + S3 |
| **Response Caching** | Every AI response is hashed and cached to avoid redundant API calls | DynamoDB (7-day TTL) |
| **Fallback System** | If Bedrock is throttled, Gemini takes over seamlessly | Exponential backoff + Gemini |

---

### 4. AWS Architecture (What Judges Want to See)

```
┌─────────────────────────┐
│   Students / Teachers    │
│       / Parents          │
└────────────┬────────────┘
             │ HTTPS
             ▼
┌─────────────────────────┐
│   AWS Amplify (CDN)     │  ← React frontend, auto-deployed from GitHub
│   Vite + React 19       │
└────────────┬────────────┘
             │ REST API
             ▼
┌─────────────────────────┐
│   Amazon EC2 (FastAPI)  │  ← Python backend with Cognito JWT verification
│   t2.micro, Ubuntu 24   │
└────────────┬────────────┘
             │
    ┌────────┼────────┬──────────┬──────────┐
    ▼        ▼        ▼          ▼          ▼
┌───────┐ ┌───────┐ ┌────────┐ ┌────────┐ ┌────────┐
│Cognito│ │Bedrock│ │DynamoDB│ │  S3    │ │  RDS   │
│ Auth  │ │Nova   │ │AI Cache│ │ PDFs   │ │Postgres│
│       │ │Lite   │ │(7d TTL)│ │Uploads │ │        │
└───────┘ └───────┘ └────────┘ └────────┘ └────────┘
```

**7 AWS Services Used:**
1. **Amazon Bedrock (Nova Lite)** — AI brain powering simplification, quizzes, and chat
2. **Amazon DynamoDB** — Caches every AI response (hash of prompt → response) to cut costs by 80%
3. **Amazon S3** — Stores student PDF uploads securely
4. **Amazon Cognito** — Managed user authentication with JWT tokens
5. **Amazon EC2** — Hosts the FastAPI backend
6. **Amazon RDS (PostgreSQL)** — Relational database for users, sessions, quiz results
7. **AWS Amplify** — Hosts the React frontend with global CDN

---

### 5. Cost Optimization (Hackathon Budget: $100)

| Strategy | How It Works | Savings |
|---|---|---|
| **DynamoDB AI Cache** | SHA-256 hash of every prompt → cached response with 7-day TTL | ~80% fewer Bedrock calls |
| **Exponential Backoff** | 3 retries with jitter on throttling, then Gemini fallback | Zero failed requests |
| **Nova Lite Model** | Cheapest Bedrock model at $0.06/1M input tokens | 10x cheaper than Claude |
| **t2.micro EC2** | Free-tier eligible instance | ~$0.50/day |
| **Total Hackathon Cost** | ~$8-12 for the entire testing week | Well under $100 |

---

### 6. What Makes LexiLearn Stand Out

1. **India-Focused**: Designed for Indian classrooms — multi-role portals reflect the teacher-parent-student triangle
2. **AI is Essential, Not Decorative**: Every core feature (simplification, quizzes, chat) is powered by Bedrock
3. **Cost-Conscious Architecture**: DynamoDB caching means we can serve thousands of students without scaling Bedrock costs linearly
4. **Production-Ready**: Not a prototype — it has auth, role-based dashboards, session tracking, and error handling
5. **Accessibility-First**: Lexend font, high contrast, dyslexia-friendly color palette — designed WITH dyslexic users, not just FOR them

---

## 🎬 Video Script (Scene-by-Scene, ~3-4 Minutes)

### SCENE 1: The Hook (0:00 - 0:20)
**[Screen: Dark background with text fading in]**

> *"35 million children in India have dyslexia. For most of them, school feels like reading a foreign language — every single day."*

**[Screen: Quick montage of a student struggling with dense text]**

> *"We built LexiLearn to change that. An AI-powered learning companion that adapts to how dyslexic students actually learn."*

---

### SCENE 2: The Problem (0:20 - 0:50)
**[Screen: Split view showing normal textbook vs simplified text]**

> *"Here's the problem: standard textbooks use complex vocabulary, long sentences, and dense paragraphs. For a dyslexic student, this isn't just difficult — it causes cognitive overload."*

> *"Teachers can't track when a student is fatigued. Parents have no visibility. And AI tools that exist today? They're generic — not built for dyslexia."*

---

### SCENE 3: Live Demo — Student Portal (0:50 - 1:40)
**[Screen: Open LexiLearn, log in as a Student]**

> *"Let me show you LexiLearn in action. I'm logged in as a student through Amazon Cognito — our managed authentication layer."*

**[Screen: Paste a complex paragraph → Click "Simplify"]**

> *"Watch what happens when I paste a paragraph from a science textbook. Amazon Bedrock's Nova Lite model rewrites it — shorter sentences, simpler words, dyslexia-friendly formatting. This isn't a template — it's generated specifically for this student's reading level."*

**[Screen: Click "Generate Quiz"]**

> *"Now I generate a quiz from that same passage. Again, Bedrock creates these questions on the fly — not pre-loaded, not hardcoded. Real AI, doing real work."*

**[Screen: Open LexiBot chat]**

> *"And if the student doesn't understand something? They ask LexiBot. It's a conversational AI tutor powered by Bedrock that explains concepts in simple, encouraging language."*

---

### SCENE 4: Live Demo — Teacher Portal (1:40 - 2:10)
**[Screen: Switch to Teacher Dashboard]**

> *"Now let's see the teacher's view. Every student's reading progress is tracked — minutes read, vocabulary mastered, comprehension scores, even fatigue levels."*

> *"Teachers can see who needs help right now, and create targeted assignments. No more guessing."*

---

### SCENE 5: Live Demo — Parent Portal (2:10 - 2:30)
**[Screen: Switch to Parent Dashboard]**

> *"Parents see their child's weekly progress — reading time, quiz scores, and messages from the teacher. For the first time, parents are part of the learning loop."*

---

### SCENE 6: Architecture Deep Dive (2:30 - 3:10)
**[Screen: Show the architecture diagram]**

> *"Under the hood, LexiLearn runs on 7 AWS services."*

> *"Amazon Bedrock Nova Lite powers all AI features. Every response is cached in DynamoDB — a hash of the prompt maps to the cached response with a 7-day TTL. This cuts our Bedrock costs by 80%."*

> *"Student PDFs go to S3. User data lives in RDS PostgreSQL. Authentication is handled by Cognito. The React frontend deploys via Amplify. The Python backend runs on EC2."*

> *"And if Bedrock ever gets throttled? Our exponential backoff kicks in — 3 retries with jitter — and if that fails, Gemini takes over seamlessly. Zero downtime for the student."*

---

### SCENE 7: The Closing (3:10 - 3:30)
**[Screen: LexiLearn logo with tagline]**

> *"LexiLearn isn't just an app — it's a bridge between AI and inclusion. 35 million children deserve to learn at their own pace, in a way that works for their brain."*

> *"Built for India. Powered by AWS. Driven by purpose."*

> *"Thank you."*

**[Screen: Fade to team name and GitHub URL]**

---

## 📌 Key Talking Points (If Judges Ask Questions)

| Question | Answer |
|---|---|
| "What happens if you remove the AI?" | "The app becomes a plain text reader. Every core feature — simplification, quizzes, chat — is powered by Bedrock. AI isn't optional, it's the engine." |
| "How do you handle costs?" | "DynamoDB caching with SHA-256 prompt hashing. Same question = cached response. 80% fewer Bedrock calls. Total hackathon cost: ~$10." |
| "Why Nova Lite and not Claude?" | "Nova Lite is purpose-built for our use case — text generation at $0.06/1M tokens. 10x cheaper than Claude with comparable quality for simplification." |
| "Is this production-ready?" | "Yes. We have Cognito auth, role-based access, error boundaries, exponential backoff, and automated CI/CD via Amplify." |
| "What's your target audience?" | "Indian students with dyslexia (ages 8-14), their teachers, and their parents. 35 million affected in India alone." |
