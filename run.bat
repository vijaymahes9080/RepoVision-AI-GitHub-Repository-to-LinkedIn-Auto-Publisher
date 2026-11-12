@echo off
setlocal

echo =========================================================
echo       Starting RepoVision AI Full-Stack Platform
echo =========================================================
echo.

:: Ensure venv exists
if not exist "backend\.venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Please run install.bat first.
    pause
    exit /b 1
)

echo [1/3] Starting FastAPI Backend (http://127.0.0.1:8000)...
start "RepoVision Backend (FastAPI)" cmd /k "cd /d %~dp0 && backend\.venv\Scripts\python -m uvicorn app.main:app --app-dir backend --host 127.0.0.1 --port 8000 --reload"

echo [2/3] Starting Vite React Frontend (http://localhost:5173)...
start "RepoVision Frontend (Vite)" cmd /k "cd /d %~dp0 && npm run dev"

echo [3/3] Opening RepoVision in your browser...
timeout /t 3 /nobreak >nul
start http://localhost:5173

echo.
echo =========================================================
echo  RepoVision AI is running!
echo  Backend:   http://127.0.0.1:8000 (API Docs: /docs)
echo  Frontend:  http://localhost:5173
echo.
echo  Press any key in this window to stop services or close
echo  the backend/frontend console windows.
echo =========================================================
echo.
pause
