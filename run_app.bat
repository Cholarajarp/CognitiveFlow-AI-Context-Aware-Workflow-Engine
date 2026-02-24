@echo off
title CognitiveFlow Launcher
echo ===================================================
echo   CognitiveFlow - AI Context-Aware Workflow Engine
echo ===================================================

:: Check for Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Python is not installed or not in PATH.
    pause
    exit /b
)

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo Error: Node.js is not installed or not in PATH.
    pause
    exit /b
)

echo.
echo [1/2] Setting up Backend...
cd backend
if not exist venv (
    echo Creating Python virtual environment...
    python -m venv venv
)

call venv\Scripts\activate
echo Installing Python dependencies...
pip install -r requirements.txt
if %errorlevel% neq 0 (
    echo Error installing backend dependencies.
    pause
    exit /b
)

echo Starting Backend Server in a new window...
start "CognitiveFlow Backend" cmd /k "call venv\Scripts\activate && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

echo.
echo [2/2] Setting up Frontend...
cd ..\frontend
if not exist node_modules (
    echo Installing Node.js dependencies (this may take a few minutes)...
    call npm install
    if %errorlevel% neq 0 (
        echo Error installing frontend dependencies.
        pause
        exit /b
    )
)

echo Starting Frontend (React + Electron)...
echo This will launch the application window.
call npm run dev

pause
