# CognitiveFlow – AI Context-Aware Workflow Engine

**CognitiveFlow** is an intelligent desktop assistant that understands your active context (open windows, applications) and leverages Google's Gemini 1.5 Pro AI to automate workflows, generate content, and analyze data in real-time. Built with a modern Python FastAPI backend and a premium React + Electron frontend.

![Project Status](https://img.shields.io/badge/Status-MVP-blue)
![License](https://img.shields.io/badge/License-MIT-green)

## 🚀 Key Features

*   **Context Awareness**: Automatically detects the active window and application name (with fallback for headless environments).
*   **AI Processing**: Integrates with Google Gemini 1.5 Pro for advanced natural language understanding and generation.
*   **Workflow Recording**: Saves all interactions, context, and AI responses to a local SQLite database.
*   **Smart Replay**: One-click replay of past workflows with updated context.
*   **Premium UI**: A "Logitech-style" dark, minimal, and responsive dashboard built with React and Tailwind CSS.
*   **Robust Architecture**: Async FastAPI backend, modular code structure, and secure environment configuration.

## 🏗 Architecture

```ascii
+-----------------------+       +-----------------------+       +-----------------------+
|                       |       |                       |       |                       |
|   Electron / React    | <---> |    FastAPI Backend    | <---> |   Google Gemini API   |
|      Frontend         | HTTP  |       (Python)        | HTTPS |      (AI Model)       |
|                       |       |                       |       |                       |
+-----------------------+       +-----------------------+       +-----------------------+
           ^                                |
           |                                v
           |                        +----------------+
           |                        |                |
           +------------------------| SQLite Database|
                                    |                |
                                    +----------------+
                                            ^
                                            |
                                    +----------------+
                                    |                |
                                    | pygetwindow OS |
                                    |   Integration  |
                                    |                |
                                    +----------------+
```

## 🛠 Tech Stack

*   **Backend**: Python 3.10+, FastAPI (Async), SQLAlchemy, Google Generative AI (`google-generativeai`), PyGetWindow.
*   **Frontend**: React 18, Tailwind CSS, Lucide Icons, Axios.
*   **Desktop Wrapper**: Electron.
*   **Database**: SQLite (Local file-based).

## 📦 Setup Instructions

### Prerequisites

*   Python 3.8 or higher
*   Node.js 16 or higher
*   Google Gemini API Key

### 1. Backend Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python -m venv venv
    # Windows
    venv\Scripts\activate
    # macOS/Linux
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Configure Environment Variables:
    *   The project expects a `.env` file in the `backend/` directory.
    *   Create `backend/.env` with the following content:
        ```
        GEMINI_API_KEY=your_actual_api_key_here
        ```

5.  Run the Backend Server:
    ```bash
    python main.py
    ```
    *   The API will start at `http://localhost:8000`.
    *   Swagger UI documentation is available at `http://localhost:8000/docs`.

### 2. Frontend Setup

1.  Navigate to the `frontend` directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Run the Development Server:
    ```bash
    npm run dev
    ```
    *   This will launch both the React dev server and the Electron wrapper.

## 🔮 Future Improvements

*   **Voice Control**: Integrate speech-to-text for hands-free operation.
*   **Cross-Platform Context**: Enhance window detection support for macOS (Quartz) and Linux (X11/Wayland) natively.
*   **Plugin System**: Allow custom Python scripts to be triggered by specific workflows.
*   **Local LLM Support**: Add support for local models (Llama 3, Mistral) for offline privacy.

---

**Author**: Cholaraja R P

