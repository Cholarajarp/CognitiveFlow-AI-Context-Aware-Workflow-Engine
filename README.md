# CognitiveFlow – AI Context-Aware Workflow Engine

CognitiveFlow is an AI-powered desktop assistant that understands your active context (open windows, applications) and helps automate workflows, generate content, or analyze data using Google's Gemini 1.5 Pro model.

## 🚀 Features

- **Context Awareness**: Automatically detects the active window and application name.
- **AI Processing**: Uses Gemini 1.5 Pro to analyze context and execute user commands.
- **Workflow Recording**: Saves your interactions and AI responses for future reference.
- **Replay Capability**: Re-run past workflows with the current context.
- **Modern UI**: Dark-themed, responsive dashboard built with React and Tailwind CSS.
- **Desktop Integration**: Packaged as an Electron app for seamless desktop experience.

## 🏗 Architecture

```ascii
+------------------+       +------------------+       +------------------+
|   Electron App   | <---> |   FastAPI Backend| <---> |   Gemini API     |
| (React Frontend) |       | (Python)         |       | (Google AI)      |
+------------------+       +------------------+       +------------------+
        ^                          |
        |                          v
        |                  +------------------+
        |                  |  SQLite Database |
        |                  +------------------+
        |
        v
+------------------+
|  OS Window API   |
| (pygetwindow)    |
+------------------+
```

## 🛠 Tech Stack

- **Backend**: Python, FastAPI, SQLAlchemy, Google Generative AI, PyGetWindow
- **Frontend**: React, Tailwind CSS, Axios, Lucide React
- **Desktop Wrapper**: Electron
- **Database**: SQLite

## 📦 Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 16+
- Google Gemini API Key

### Backend Setup

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   # Windows
   venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   - Rename `.env.example` to `.env`
   - Add your Gemini API key: `GEMINI_API_KEY=your_key_here`
5. Run the server:
   ```bash
   uvicorn main:app --reload
   ```

### Frontend Setup

1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server (React + Electron):
   ```bash
   npm run dev
   ```

## 🔮 Future Improvements

- **Voice Commands**: Integrate speech-to-text for hands-free operation.
- **Cross-Platform Support**: Enhance window detection for macOS and Linux.
- **Plugin System**: Allow third-party integrations for specific apps (e.g., VS Code, Excel).
- **Local LLM Support**: Option to use local models (Llama 3, Mistral) for privacy.

---

**License**: MIT
**Author**: CognitiveFlow Team
