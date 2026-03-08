from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import uvicorn
from app.core.database import engine, Base
from app.api.routes import auth, users, sessions, quizzes, analytics, processing

from app.core.config import settings

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API for LexiLearn - Dyslexia-First Learning Platform",
    version=settings.API_VERSION,
)

# Set up CORS - MUST be first middleware to ensure headers on error responses
CORS_ORIGINS = settings.BACKEND_CORS_ORIGINS
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Custom exception handlers to ensure CORS headers appear on 401/403 errors
from fastapi.exceptions import HTTPException as FastAPIHTTPException

@app.exception_handler(FastAPIHTTPException)
async def http_exception_handler(request: Request, exc: FastAPIHTTPException):
    origin = request.headers.get("origin", "")
    headers = {
        "Access-Control-Allow-Origin": origin if origin in CORS_ORIGINS else CORS_ORIGINS[0],
        "Access-Control-Allow-Credentials": "true",
    }
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail},
        headers=headers,
    )

@app.get("/")
async def root():
    return {"message": "Welcome to LexiLearn API", "status": "healthy"}

@app.get("/api/health")
async def health_check():
    return {"status": "ok", "version": "0.1.0"}

from app.api.routes import demo

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/api/users", tags=["Users"])
app.include_router(sessions.router, prefix="/api/sessions", tags=["Learning Sessions"])
app.include_router(quizzes.router, prefix="/api/quizzes", tags=["Quizzes"])
app.include_router(analytics.router, prefix="/api/analytics", tags=["Analytics"])
app.include_router(processing.router, prefix="/api/processing", tags=["Text Processing"])
app.include_router(demo.router, prefix="/api/demo", tags=["Demo Data"])

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
