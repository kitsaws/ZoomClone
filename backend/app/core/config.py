from typing import List, Union
from pydantic import AnyHttpUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    PROJECT_NAME: str = "Zoom Clone Backend API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    # Server configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Database connection string (SQLite by default)
    DATABASE_URL: str = "sqlite:///./zoom_clone.db"
    
    # LiveKit SFU Configuration
    LIVEKIT_URL: str = "wss://zoom-clone-439p850o.livekit.cloud"
    LIVEKIT_API_KEY: str = "APIS7q9saEU2GVH"
    LIVEKIT_API_SECRET: str = "b2HqHeW9HvEuDviPsxTRVk9SneexwekYAyWe2CKSMNzF"
    
    # CORS Origins
    CORS_ORIGINS: Union[List[str], str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "https://zoomclone-vrmo.onrender.com",
        "https://zoom-clone-mocha-six.vercel.app",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            if v == "*":
                return ["*"]
            if not v.startswith("["):
                origins = []
                for item in v.split(","):
                    cleaned = item.strip()
                    if cleaned:
                        origins.append(cleaned)
                        origins.append(cleaned.rstrip("/"))
                return list(set(origins))
        elif isinstance(v, list):
            origins = []
            for item in v:
                if isinstance(item, str):
                    origins.append(item.strip())
                    origins.append(item.strip().rstrip("/"))
            return list(set(origins))
        return ["*"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="ignore",
    )


settings = Settings()
