# CognitiveFlow – AI Context-Aware Workflow Engine

**CognitiveFlow** is a production-ready that reads active desktop context, sends user intent to Gemini AI, records workflows in SQLite, and lets users replay and export AI outputs from a premium desktop-style UI.

![Project Status](https://img.shields.io/badge/Status-MVP-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## Project Overview

- Detect active window title and app name via `pygetwindow`
- Process requests with FastAPI + Gemini API
- Store workflows in SQLite with timestamps and replay support
- Render a dark, minimal React + Tailwind dashboard
- Run in browser or Electron shell
- Export AI responses as `.txt` and `.pdf`
- Start fresh with `New Workflow` and manage history with delete controls

## Architecture

```ascii
+-----------------------+       +-----------------------+       +-------------------------+
|                       |       |                       |       |                         |
|  React + Tailwind UI  | <---> |    FastAPI Backend    | <---> |  Google Gemini API      |
|  (Browser/Electron)   | HTTP  |      (Python)         | HTTPS |  (Model chosen by key)  |
|                       |       |                       |       |                         |
+-----------------------+       +-----------------------+       +-------------------------+
           ^                                |
           |                                v
           |                        +-----------------------+
           |                        |       SQLite DB       |
           +------------------------|   workflow history    |
                                    +-----------------------+
                                            ^
                                            |
                                    +-----------------------+
                                    |    pygetwindow OS     |
                                    |   active context API  |
                                    +-----------------------+
```

## Tech Stack

- Backend: Python, FastAPI, SQLAlchemy, SQLite, `google-generativeai`, `python-dotenv`, `pygetwindow`
- Frontend: React 18, Tailwind CSS, Axios, Lucide Icons, jsPDF
- Desktop wrapper: Electron

## Project Structure

```text
cognitiveflow/
  backend/
    main.py
    ai_engine.py
    workflow.py
    database.py
    config.py
    requirements.txt
    .env.example
    database.db
  frontend/
    src/
      App.js
      index.js
      index.css
    public/
      electron.js
      index.html
    scripts/
      start-electron.js
    package.json
  HACKATHON_SUBMISSION.md
  LICENSE
  README.md
```

## Setup Instructions

### Prerequisites

- Python 3.10+
- Node.js 18+
- Gemini API key

### 1. Backend Setup

```bash
cd backend
python -m venv venv
# Windows
venv\Scripts\activate
# macOS/Linux
source venv/bin/activate
pip install -r requirements.txt
```

Create `backend/.env` (this file is gitignored):

```env
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-2.5-pro
```

Notes:
- `backend/.env.example` is committed for sharing config shape.
- You can set `GEMINI_MODEL=gemini-1.5-pro` if your key has access; otherwise use 2.5/3.0.

Run backend:

```bash
python main.py
```

Backend URLs:
- API root: `http://localhost:8000`
- Swagger docs: `http://localhost:8000/docs`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

This runs:
- React dev server at `http://localhost:3000`
- Electron app connected to the same UI

## API Summary

- `GET /context`: returns active window context
- `POST /ai`: sends text + mode to Gemini and optionally records workflow
- `GET /workflows`: lists saved workflows
- `POST /workflows/replay/{id}`: replays saved workflow with current context
- `DELETE /workflows/{id}`: removes one workflow item
- `DELETE /workflows`: clears all workflow history

## Exporting AI Responses

From the UI response panel:
- Click `Export TXT` to download plain text output
- Click `Export PDF` to download formatted PDF output

## Error Handling

- Async FastAPI endpoints with structured HTTP errors
- AI failures return explicit API error details (instead of silent success payloads)
- Database write errors are rolled back safely
- Frontend surfaces backend error messages in the response panel

## Future Improvements

- Role-based auth and encrypted per-user workflow storage
- Multi-provider AI routing (Gemini/OpenAI/local fallback)
- Scheduled automations and background agents
- Rich export templates (markdown, DOCX, branded PDF)

## License

This project is licensed under the MIT License. See `LICENSE`.

