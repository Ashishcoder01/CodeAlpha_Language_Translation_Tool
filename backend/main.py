import argostranslate.translate
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field


app = FastAPI(
    title="LinguaFlow Translation API",
    description="Local AI-powered language translation API",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


LANGUAGE_NAMES = {
    "en": "English",
    "hi": "Hindi",
    "fr": "French",
    "de": "German",
    "es": "Spanish",
    "it": "Italian",
}


class TranslationRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=5000)
    source: str = Field(default="en", min_length=2, max_length=10)
    target: str = Field(..., min_length=2, max_length=10)


def get_translation_pairs():
    """Return all actually installed translation directions."""

    languages = argostranslate.translate.get_installed_languages()

    pairs = set()

    for language in languages:
        for translation in language.translations_from:
            source = translation.from_lang.code
            target = translation.to_lang.code

            if source != target:
                pairs.add((source, target))

    return sorted(pairs)


@app.get("/")
def home():
    return {
        "message": "LinguaFlow Translation API",
        "status": "running",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "service": "translation-api",
    }


@app.get("/api/languages")
def get_languages():
    """Return languages involved in installed translation pairs."""

    pairs = get_translation_pairs()

    codes = sorted(
        set(source for source, _ in pairs)
        | set(target for _, target in pairs)
    )

    return [
        {
            "code": code,
            "name": LANGUAGE_NAMES.get(code, code.upper()),
        }
        for code in codes
        if code in LANGUAGE_NAMES
    ]


@app.get("/api/languages/pairs")
def get_translation_pairs_api():
    """Return all supported translation directions."""

    pairs = get_translation_pairs()

    return [
        {
            "source": source,
            "target": target,
        }
        for source, target in pairs
    ]


@app.post("/api/translate")
def translate(request: TranslationRequest):

    text = request.text.strip()

    if not text:
        raise HTTPException(
            status_code=400,
            detail="Text cannot be empty.",
        )

    source = request.source.lower()
    target = request.target.lower()

    pairs = get_translation_pairs()

    if source != target and (source, target) not in pairs:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Translation direction "
                f"{source} -> {target} is not available."
            ),
        )

    if source == target:
        return {
            "translated_text": text,
            "source": source,
            "target": target,
        }

    try:
        translated_text = argostranslate.translate.translate(
            text,
            source,
            target,
        )

        if not translated_text:
            raise HTTPException(
                status_code=502,
                detail="Translation engine returned no result.",
            )

        return {
            "translated_text": translated_text,
            "source": source,
            "target": target,
        }

    except HTTPException:
        raise

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Translation failed: {str(error)}",
        )