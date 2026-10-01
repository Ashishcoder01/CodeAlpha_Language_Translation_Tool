# LinguaFlow – Language Translation Tool

LinguaFlow is a modern web-based language translation application developed as part of the CodeAlpha AI Internship.

It provides a clean interface for translating text between supported languages using a FastAPI backend and the Argos Translate local translation engine.

## Features

- Modern responsive translation interface
- English, Hindi, French, German, Spanish and Italian support
- Bidirectional translation for supported language pairs
- FastAPI backend
- Local AI translation engine
- Copy translated text
- Text-to-speech support
- Source and target language swapping
- Character counter
- Loading and error states
- REST API architecture
- Swagger API documentation

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- CSS

### Backend

- Python
- FastAPI
- Uvicorn
- Pydantic

### Translation

- Argos Translate

## Project Structure

```text
CodeAlpha_Language_Translation_Tool/
│
├── backend/
│   ├── main.py
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── .gitignore
├── LICENSE
└── README.md