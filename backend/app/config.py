from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "signova-super-secret-key-2025"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    DATABASE_URL: str = "sqlite:///./signova.db"

    class Config:
        env_file = ".env"

settings = Settings()