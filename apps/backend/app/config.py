import os
from pathlib import Path
from dotenv import load_dotenv


class Settings:
    def __init__(self):
        backend_dir = Path(__file__).resolve().parents[1]
        load_dotenv(backend_dir / ".env.local")
        self.MONGO_DB_URI = os.getenv("MONGO_DB_URI")
        self.S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
        self.S3_REGION = os.getenv("S3_REGION")
        self.S3_ACCESS_KEY_ID = os.getenv("S3_ACCESS_KEY_ID")
        self.S3_SECRET_ACCESS_KEY = os.getenv("S3_SECRET_ACCESS_KEY")
        # Storage
        # If S3 vars are not provided, the backend will fall back to local storage.
        self.LOCAL_STORAGE_DIR = os.getenv("LOCAL_STORAGE_DIR", "uploads")
        # Optional: used to build absolute URLs for uploaded files, e.g. http://localhost:8000
        self.PUBLIC_BASE_URL = os.getenv("PUBLIC_BASE_URL")

        # Local LLM (Ollama)
        self.OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
        self.OLLAMA_MODEL = os.getenv("OLLAMA_MODEL", "llama3.2")
        self.OLLAMA_TIMEOUT_SECONDS = int(os.getenv("OLLAMA_TIMEOUT_SECONDS", "180"))


settings = Settings()
