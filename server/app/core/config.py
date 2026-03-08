import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional, List, Union

# Resolve the .env file path relative to this file (goes up 3 levels to project root)
_ROOT_DIR = Path(__file__).parent.parent.parent.parent  # server/app/core/config.py -> project root
_ENV_FILE = _ROOT_DIR / ".env"

class Settings(BaseSettings):
    PROJECT_NAME: str = "LexiLearn"
    API_VERSION: str = "v1"
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # Security
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-in-production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./lexilearn.db")
    
    # AI APIs
    GEMINI_API_KEY: Optional[str] = os.getenv("GEMINI_API_KEY")
    VITE_GEMINI_API_KEY: Optional[str] = os.getenv("VITE_GEMINI_API_KEY") # Support the key from shared .env

    # AWS Configuration
    AWS_ACCESS_KEY_ID: Optional[str] = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: Optional[str] = os.getenv("AWS_SECRET_ACCESS_KEY")
    AWS_REGION: str = os.getenv("AWS_REGION", "us-east-1")
    BEDROCK_MODEL_ID: str = os.getenv("BEDROCK_MODEL_ID", "us.amazon.nova-lite-v1:0")
    S3_BUCKET_NAME: str = os.getenv("S3_BUCKET_NAME", "lexilearn-uploads")
    DYNAMODB_CACHE_TABLE: str = os.getenv("DYNAMODB_CACHE_TABLE", "LexiLearn_AICache")

    # Amazon Cognito
    COGNITO_REGION: Optional[str] = os.getenv("COGNITO_REGION")
    COGNITO_USER_POOL_ID: Optional[str] = os.getenv("COGNITO_USER_POOL_ID")
    COGNITO_APP_CLIENT_ID: Optional[str] = os.getenv("COGNITO_APP_CLIENT_ID")

    # CORS — comma-separated list of allowed origins (set FRONTEND_URL in production)
    # e.g. FRONTEND_URL=https://main.d1abc123.amplifyapp.com
    FRONTEND_URL: Optional[str] = os.getenv("FRONTEND_URL", "")

    @property
    def BACKEND_CORS_ORIGINS(self) -> List[str]:  # type: ignore[override]
        origins = [
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:5174",
            "http://127.0.0.1:5174",
            "http://localhost:3000",
            "https://main.d2z7vfqfduv71z.amplifyapp.com",
        ]
        if self.FRONTEND_URL:
            # Support comma-separated list: "https://x.amplifyapp.com,https://custom.com"
            for url in self.FRONTEND_URL.split(","):
                url = url.strip()
                if url and url not in origins:
                    origins.append(url)
        return origins

    class Config:
        case_sensitive = True
        env_file = str(_ENV_FILE)
        extra = "allow"

settings = Settings()
