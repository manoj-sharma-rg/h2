"""
Configuration management for RGBridge PMS Integration Platform
"""

from pydantic_settings import BaseSettings
from pydantic import Field
from typing import List, Optional
import os


class Settings(BaseSettings):
    """Application settings"""
    
    # Application settings
    APP_NAME: str = "RGBridge PMS Integration Platform"
    VERSION: str = "1.0.0"
    DEBUG: bool = Field(default=False, env="DEBUG")
    
    # Server settings
    HOST: str = Field(default="0.0.0.0", env="HOST")
    PORT: int = Field(default=8000, env="PORT")
    
    # CORS settings
    ALLOWED_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:8000"],
        env="ALLOWED_ORIGINS"
    )
    
    # Authentication settings
    API_KEY_HEADER: str = Field(default="X-API-Key", env="API_KEY_HEADER")
    API_KEYS: List[str] = Field(default=[], env="API_KEYS")
    
    # Internal API settings
    INTERNAL_API_URL: str = Field(default="http://localhost:8080", env="INTERNAL_API_URL")
    INTERNAL_API_TIMEOUT: int = Field(default=30, env="INTERNAL_API_TIMEOUT")
    INTERNAL_API_RETRY_ATTEMPTS: int = Field(default=3, env="INTERNAL_API_RETRY_ATTEMPTS")
    INTERNAL_API_RETRY_DELAY: int = Field(default=1, env="INTERNAL_API_RETRY_DELAY")
    
    # Logging settings
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(
        default="%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s",
        env="LOG_FORMAT"
    )
    
    # File paths
    MAPPING_DIR: str = Field(default="mappings", env="MAPPING_DIR")
    SCHEMA_DIR: str = Field(default="schemas", env="SCHEMA_DIR")
    
    # Database settings (for future use)
    DATABASE_URL: Optional[str] = Field(default=None, env="DATABASE_URL")
    
    OPENAI_API_KEY: str | None = None 
    
    class Config:
        env_file = ".env"
        case_sensitive = True


# Create settings instance
settings = Settings() 