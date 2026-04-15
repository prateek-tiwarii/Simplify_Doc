import shutil
from fastapi import UploadFile
from app.config import settings
import datetime
from pathlib import Path

def _build_public_url(path: str) -> str:
    """Build absolute URL if PUBLIC_BASE_URL is set; otherwise return path."""
    base = (settings.PUBLIC_BASE_URL or "").strip().rstrip("/")
    if not base:
        return path
    return f"{base}{path if path.startswith('/') else '/' + path}"


def _local_upload_path(key: str) -> Path:
    uploads_dir = Path(settings.LOCAL_STORAGE_DIR or "uploads")
    return uploads_dir / key


async def _upload_to_local(file: UploadFile, user: str) -> str:
    base_filename = file.filename if len(file.filename or "") <= 10 else file.filename[:10]
    base_filename = (base_filename or "upload").replace(" ", "_")
    base_filename = base_filename.replace(".pdf", "")
    filename = f"{datetime.datetime.now().timestamp()}_{base_filename}.pdf"
    key = f"{user}/{filename}"

    dest = _local_upload_path(key)
    dest.parent.mkdir(parents=True, exist_ok=True)
    content = await file.read()
    with open(dest, "wb") as out:
        out.write(content)

    return _build_public_url(f"/uploads/{key}")

async def upload_to_s3(file: UploadFile, user: str) -> str:
    """Uploads file to local storage. Maintained the upload_to_s3 signature for compatibility."""
    return await _upload_to_local(file, user)
