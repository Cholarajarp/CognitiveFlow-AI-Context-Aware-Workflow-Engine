import asyncio
from typing import Optional

import google.generativeai as genai

from config import GEMINI_API_KEY, GEMINI_MODEL

if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


class AIEngineError(Exception):
    """Raised when Gemini generation cannot be completed."""


_MODEL_NAME_CACHE: Optional[str] = None
_PREFERRED_MODEL_PREFIXES = (
    "models/gemini-3.0",
    "models/gemini-2.5",
    "models/gemini-1.5",
)


def _normalize_model_name(model_name: str) -> str:
    normalized = model_name.strip()
    if not normalized:
        return normalized
    if normalized.startswith("models/"):
        return normalized
    return f"models/{normalized}"


def _resolve_model_name() -> str:
    global _MODEL_NAME_CACHE

    if GEMINI_MODEL:
        return _normalize_model_name(GEMINI_MODEL)

    if _MODEL_NAME_CACHE:
        return _MODEL_NAME_CACHE

    try:
        available_models = []
        for model in genai.list_models():
            if "generateContent" in getattr(model, "supported_generation_methods", []):
                available_models.append(model.name)
    except Exception as exc:
        raise AIEngineError(f"Unable to list Gemini models: {exc}") from exc

    for preferred_prefix in _PREFERRED_MODEL_PREFIXES:
        for model_name in available_models:
            if model_name.startswith(preferred_prefix):
                _MODEL_NAME_CACHE = model_name
                return model_name

    if available_models:
        _MODEL_NAME_CACHE = available_models[0]
        return _MODEL_NAME_CACHE

    raise AIEngineError("No Gemini model with generateContent support is available.")


def _generate_response_sync(prompt: str, context: str) -> str:
    model_name = _resolve_model_name()
    model = genai.GenerativeModel(model_name)
    full_prompt = f"Context: {context}\n\nUser Request: {prompt}"
    response = model.generate_content(full_prompt)
    response_text = (getattr(response, "text", "") or "").strip()

    if not response_text:
        raise AIEngineError(f"Gemini returned an empty response (model: {model_name}).")

    return response_text


async def get_gemini_response(prompt: str, context: str = "") -> str:
    if not GEMINI_API_KEY:
        raise AIEngineError("GEMINI_API_KEY not found in environment variables.")

    try:
        return await asyncio.to_thread(_generate_response_sync, prompt, context)
    except AIEngineError:
        raise
    except Exception as exc:
        raise AIEngineError(str(exc)) from exc
