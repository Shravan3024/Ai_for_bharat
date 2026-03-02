# LexiLearn - Dyslexia-First Learning Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vite](https://img.shields.io/badge/Vite-7.2+-646CFF?style=flat&logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19+-61DAFB?style=flat&logo=react)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![SQLite](https://img.shields.io/badge/SQLite-3.0+-003B57?style=flat&logo=sqlite)](https://www.sqlite.org/)

LexiLearn is a comprehensive full-stack education platform designed to support students with dyslexia through AI-powered text simplification, personalized assessments, and role-based portals for students, teachers, and parents.

## 🌟 Features

  - **AI-Powered Text Simplification**: Automatically simplify complex texts to reduce visual stress and improve comprehension using Amazon Bedrock/Gemini.
  - **Student Fatigue Analytics**: Real-time tracking of reading speed, session duration, and simplification requests to calculate fatigue scores.
  - **AI-Generated Quizzes**: Dynamically generate quizzes from any reading material to test comprehension.
  - **Multi-Role Portals**:
    - **Student Portal**: Access simplified content, take sessions, and track performance.
    - **Teacher Portal**: Monitor student progress, view detailed analytics, and manage learning content.
    - **Parent Portal**: View real-time performance summaries and historical session data.
  - **Accessibility-First Design**: Dyslexia-friendly typography (Lexend font), high-contrast layouts, and intuitive navigation.
  - **Real-time Session Tracking**: Tracks every reading session with granular metrics for data-driven insights.
  
  ## 🛠️ Tech Stack
  
  ### Frontend
  - **Framework**: Vite + React 19
  - **UI Library**: Tailwind CSS v4 with PostCSS
  - **Animations**: Framer Motion
  - **Icons**: Lucide React
  - **State Management**: Zustand & TanStack Query (React Query)
  - **Navigation**: React Router 7
  
  ### Backend
  - **Framework**: FastAPI (Python 3.12+)
  - **ORM**: SQLAlchemy
  - **AI Integration**: Amazon Bedrock (Primary) & Google Gemini AI (Fallback)
  - **NLP**: SpaCy, NLTK, Scikit-learn (for fatigue analytics)
  - **Security**: JWT Authentication with Passlib (Bcrypt)
  
  ### Database
  - **Database**: SQLite (Development) / PostgreSQL compatible
  - **Persistence**: File-based `lexilearn.db` for easy local setup
  
  ## 🚀 Installation
  
  ### Prerequisites
  - Node.js 18+
  - Python 3.12+
  - Git
  
  ### One-Click Setup (Recommended)
  We provide startup scripts to launch both frontend and backend automatically:
  
  **Windows:**
  ```bash
  ./run_project.bat
  ```
  
  **Linux/macOS:**
  ```bash
  bash run_project.sh
  ```
  
  ---
  
  ### Manual Setup
  
  #### Backend Setup
  1. Navigate to the server directory:
     ```bash
     cd server
     ```
  2. Set up Python virtual environment:
     ```bash
     python -m venv venv
     source venv/bin/activate  # On Windows: venv\Scripts\activate
     ```
  3. Install dependencies:
     ```bash
     pip install -r requirements.txt
     ```
  4. Create a `.env` file in the `server` directory:
     ```env
     SECRET_KEY=your_jwt_secret_key
     GEMINI_API_KEY=your_gemini_api_key
     ```
  5. Run the backend server:
     ```bash
     python -m app.main
     ```
  
  #### Frontend Setup
  1. From the project root:
     ```bash
     npm install
     # or
     bun install
     ```
  2. Create a `.env` file in the root:
     ```env
     VITE_GEMINI_API_KEY=your_gemini_api_key
     ```
  3. Run the development server:
     ```bash
     npm run dev
     ```
  
  ## 🔌 API Endpoints
  
  The backend provides the following main API modules:
  
  - `POST /api/auth/register` - User registration
  - `POST /api/auth/login` - User login (returns JWT)
  - `POST /api/processing/simplify` - AI-powered text simplification
  - `POST /api/processing/quiz/generate` - Dynamic quiz generation
  - `GET /api/analytics/summary/{user_id}` - Student performance analytics
  - `POST /api/sessions/start` - Track a new learning session
  
  Visit `http://localhost:8000/docs` for the full interactive Swagger documentation.
  
  ## 🤝 Contributing
  
  1. Fork the repository
  2. Create a feature branch: `git checkout -b feature/amazing-feature`
  3. Commit your changes: `git commit -m 'Add amazing feature'`
  4. Push to the branch: `git push origin feature/amazing-feature`
  5. Open a Pull Request
  
  ## 📄 License
  
  This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
  
  ## 👥 Authors
  
  - **Rushikesh Bobade** - *Project Lead & Lead Developer* - [GitHub](https://github.com/rushikesh-bobade)
  
  ## 🙏 Acknowledgments
  
  - Amazon Bedrock and Google Gemini for powering the intelligence layer.
  - The Lexend project for providing high-readability fonts.
  - The open-source community for the robust Python and React ecosystems.
  
  ---
  
  *Made with ❤️ for students with dyslexia everywhere*
