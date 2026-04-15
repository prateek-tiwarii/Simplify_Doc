import os
import tempfile
import uuid
import logging
from pathlib import Path
import shutil
from urllib.parse import urlparse

import httpx

from app.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _try_copy_local_upload(url_or_path: str, dest: Path) -> bool:
    """If the input points to our local /uploads/*, copy it to dest and return True."""

    raw = (url_or_path or "").strip()
    if not raw:
        return False

    upload_path: str | None = None

    # Relative URL
    if raw.startswith("/uploads/"):
        upload_path = raw
    else:
        # Absolute URL -> parse and check path
        try:
            parsed = urlparse(raw)
            if parsed.scheme in ("http", "https") and parsed.path.startswith("/uploads/"):
                upload_path = parsed.path
        except Exception:
            upload_path = None

    if not upload_path:
        return False

    rel = upload_path[len("/uploads/") :]
    uploads_dir = Path(settings.LOCAL_STORAGE_DIR or "uploads").resolve()
    source = (uploads_dir / rel).resolve()
    if uploads_dir not in source.parents and source != uploads_dir:
        raise ValueError("Invalid local upload path")
    if not source.exists():
        raise FileNotFoundError(f"Local upload not found: {source}")

    shutil.copyfile(source, dest)
    logger.info(f"Copied local PDF to {dest}")
    return True


async def download_pdf_to_temp(url: str, timeout: int = 60) -> str:
    tmp_dir = tempfile.mkdtemp(prefix="pdf_")
    dest = Path(tmp_dir) / f"{uuid.uuid4().hex}.pdf"

    url = (url or "").strip()
    # Local storage shortcut: /uploads/<user>/<file>.pdf or http(s)://*/uploads/*
    if _try_copy_local_upload(url, dest):
        return str(dest)

    # Absolute local filesystem path support
    try:
        candidate = Path(url)
        if candidate.is_absolute() and candidate.exists():
            shutil.copyfile(candidate, dest)
            logger.info(f"Copied PDF from path to {dest}")
            return str(dest)
    except Exception:
        pass

    # Default: remote URL (S3/HTTP)
    timeout_cfg = httpx.Timeout(timeout)
    async with httpx.AsyncClient(follow_redirects=True, timeout=timeout_cfg) as client:
        async with client.stream("GET", url) as r:
            r.raise_for_status()
            with open(dest, "wb") as f:
                async for chunk in r.aiter_bytes(chunk_size=1024 * 1024):
                    if chunk:
                        f.write(chunk)
    logger.info(f"Downloaded PDF to {dest}")
    return str(dest)  # Return the local path to the PDF


def remove_temp_files(file_path: str):
    """Removes the temporary PDF file."""
    try:
        os.remove(file_path)
        logger.info(f"Removed temp file {file_path}")
    except Exception as e:
        logger.error(f"Error removing temp file {file_path}: {e}")
