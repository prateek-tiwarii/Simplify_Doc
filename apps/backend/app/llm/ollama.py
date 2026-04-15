from __future__ import annotations

import json
from typing import Any

import httpx

from app.config import settings


class OllamaError(RuntimeError):
    pass


async def ollama_generate_json(prompt: str) -> dict[str, Any]:
    """Call Ollama and return a parsed JSON object.

    Uses Ollama's /api/generate endpoint and requests JSON-only output.
    """

    base = (settings.OLLAMA_BASE_URL or "http://localhost:11434").rstrip("/")
    url = f"{base}/api/generate"

    payload = {
        "model": settings.OLLAMA_MODEL or "llama3.2",
        "prompt": prompt,
        "stream": False,
        "format": "json",
        "options": {
            "temperature": 0.2,
        },
    }

    timeout = httpx.Timeout(settings.OLLAMA_TIMEOUT_SECONDS or 180.0)
    async with httpx.AsyncClient(timeout=timeout) as client:
        resp = await client.post(url, json=payload)
        if resp.status_code >= 400:
            raise OllamaError(f"Ollama error {resp.status_code}: {resp.text}")
        data = resp.json()

    # Ollama returns: { response: "...", done: true, ... }
    text = data.get("response")
    if not isinstance(text, str) or not text.strip():
        raise OllamaError("Ollama returned an empty response")

    # text should already be JSON due to format=json, but be defensive
    try:
        return json.loads(text)
    except Exception as e:
        raise OllamaError(f"Failed to parse JSON from Ollama response: {text[:2000]}") from e
