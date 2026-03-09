# LexiLearn Architecture & Deployment Guide

This document holds the comprehensive technical architecture, features implemented, and AWS infrastructure setup for the **LexiLearn** platform.

---

## 🏗️ Technology Stack

### Frontend (Client-Side)
- **Framework**: React 18 (Bootstrapped with Vite)
- **Styling**: Tailwind CSS for rapid UI development
- **Icons**: Lucide React
- **State Management**: Zustand (`authStore.js` and `accessibilityStore.js`)
- **Routing**: React Router DOM
- **Charts**: Recharts (for Student & Teacher dashboards)
- **Deployment**: AWS Amplify Hosting

### Backend (Server-Side)
- **Framework**: FastAPI (Python 3)
- **Server**: Uvicorn (ASGI)
- **Database**: SQLite (via SQLAlchemy ORM) for local relational data storage (Users, Progress).
- **Authentication**: JWT parsing via `python-jose`, integrating directly with AWS Cognito JWKS.
- **Deployment**: Amazon EC2 (`t2.micro` running Ubuntu) HTTP server.

### Core AI & Infrastructure (AWS Services)
1. **Amazon Bedrock**: Powering the core AI features. We use the `Amazon Nova Lite` model (`us.amazon.nova-lite-v1:0`) for blazing-fast inference when simplifying dyslexic texts, generating quizzes, and powering LexiBot.
2. **Amazon Cognito**: Handles secure user authentication, registration, and issues JWT tokens. (User Pool ID: `us-east-1_eYn9ZPpa8`).
3. **Amazon DynamoDB**: Used as a caching layer for AI responses (`LexiLearn_AICache`). Before calling Bedrock, the API checks the cache to drastically save costs and reduce latency.
4. **Amazon S3**: Used for storing educational PDFs and text materials uploaded by teachers/students (`lexilearn-uploads-211125615938`).
5. **Amazon EC2**: Hosts the FastAPI backend application on IP `54.167.45.45:8000`. Set up with a virtual environment and a background `nohup` service.
6. **Amazon CloudFront**: Acts as an HTTPS Reverse Proxy in front of the HTTP EC2 instance (`d9npieqx6bm8a.cloudfront.net`). This resolves "Mixed Content" cross-origin blocking from the frontend HTTPS app.
7. **AWS Amplify**: Connected directly to the `deploy` branch of the GitHub repository. It builds and hosts the React application at `https://main.d2z7vfqfduv71z.amplifyapp.com` and provides a global CDN.
8. **IAM**: Roles and policies were explicitly mapped for the EC2 instance to read/write from DynamoDB, call Bedrock, and upload to S3 securely.

*(Note: We also implemented a fallback mechanism using Google Gemini `gemini-1.5-flash` in case Bedrock ever hits rate limits during heavy demonstration periods.)*

---

## 🚀 Features Implemented

### 1. General & Authentication
- **Custom Branding**: Fully customized Tailwind theme, modern Glassmorphism UI, OpenDyslexic font toggle, and official LexiLearn logo + Favicon.
- **Secure Login/Registration**: Connected to AWS Cognito.
- **"Quick Demo Access" Buttons**: We built a custom "Demo User Bypass" in the backend (`deps.py`). Clicking a demo button logs the user in instantly with a mocked `demo-token-*` (bypassing Cognito) and hooks them directly to an active database profile. Perfect for hackathon judges!

### 2. Student Portal (`/student`)
- **Dashboard**: Displays a weekly progress chart, streak tracking, and recently assigned library texts.
- **Library (`/library`)**: A grid of reading materials. Students can click a text to open the "AI Reading Mode".
- **AI Reading Assistant**: Simplifies complex text into easy-to-read, dyslexia-friendly language using Amazon Bedrock. Highlights specific vocabulary definitions.
- **AI Comprehension Quizzes**: Generates dynamic multiple-choice quizzes after a text is read to test understanding.
- **LexiBot (`/chat`)**: A friendly, conversational AI tutor explicitly prompted to be patient, use short sentences, and help students with learning differences.

### 3. Teacher Portal (`/teacher`)
- **Student Analytics**: A dashboard showing the aggregate progress of all assigned students across the classroom (reading times, quiz scores).
- **Classroom Management**: Lists students (e.g., Aditi, Rohan) and allows the teacher to view individual performance.
- **Assignments**: Teachers can upload new reading texts or assign predefined library items to specific cohorts.

### 4. Parent Portal (`/parent`)
- **Child Progress Monitoring**: Visualizes their child's reading streaks, accuracy metrics, and recent activity (e.g., "Read *The Solar System*").
- **Communication**: Allows parents to stay in sync with the teacher's latest assignments.

---

## 🌐 Live URLs & Endpoints

- **Live Site Frontend**: [https://main.d2z7vfqfduv71z.amplifyapp.com](https://main.d2z7vfqfduv71z.amplifyapp.com)
- **Live AWS CloudFront API (HTTPS)**: [https://d9npieqx6bm8a.cloudfront.net/api](https://d9npieqx6bm8a.cloudfront.net/api)
- **Direct EC2 Server IP (HTTP)**: `54.167.45.45:8000`

### Quick Commands for the EC2 Backend
If you ever need to manually restart the backend, SSH into the EC2 instance and run:
```bash
cd /home/ubuntu/app/server
source venv/bin/activate
pkill -f uvicorn
nohup python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > /var/log/lexilearn.log 2>&1 &
```

---

## 🛠️ Key Technical Problem Solved During Setup

**The "Mixed Content" Block**:
Amplify enforces `HTTPS`, but our EC2 instance runs `HTTP` without a custom domain/SSL certificate. Browsers block HTTPS sites from making HTTP API requests.
**Our Solution**: We dynamically provisioned an **Amazon CloudFront Distribution** to sit in front of the EC2 instance. CloudFront issues a free `HTTPS` URL (`d9npieqx6bm8a.cloudfront.net`), securely encrypts the traffic from the frontend, and proxies it via `HTTP` to our backend—completely solving the Mixed Content policy securely and elegantly!
