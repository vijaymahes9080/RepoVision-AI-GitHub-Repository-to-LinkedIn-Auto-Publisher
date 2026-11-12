@echo off
setlocal enabledelayedexpansion

echo =========================================================
echo       RepoVision AI - Full-Stack Automated Installer
echo =========================================================
echo.

:: 1. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.12+.
    pause
    exit /b 1
)

:: 2. Check Node
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js/npm is not installed or not in PATH. Please install Node.js 20+.
    pause
    exit /b 1
)

:: 3. Python Virtual Environment
echo [1/5] Setting up Python virtual environment...
if not exist "backend\.venv" (
    python -m venv backend\.venv
)

echo [2/5] Installing backend dependencies...
backend\.venv\Scripts\python -m pip install --upgrade pip
backend\.venv\Scripts\python -m pip install -e "backend[dev]"
backend\.venv\Scripts\python -m pip install playwright
backend\.venv\Scripts\python -m playwright install chromium

:: 4. Frontend Dependencies
echo [3/5] Installing frontend dependencies...
call npm install

:: 5. Environment & Secret Setup
echo [4/5] Initializing environment configuration...
if not exist "backend\.env" (
    echo Creating backend\.env from template...
    copy backend\.env.example backend\.env >nul
    copy backend\.env .env >nul
)

:: Ensure Fernet TOKEN_ENCRYPTION_KEY is present
backend\.venv\Scripts\python -c "from cryptography.fernet import Fernet; import os; p = 'backend/.env'; open(p, 'a').write('\nTOKEN_ENCRYPTION_KEY=' + Fernet.generate_key().decode() + '\n') if 'TOKEN_ENCRYPTION_KEY' not in open(p).read() else None"
copy backend\.env .env >nul 2>nul

:: 6. Database Initialization
echo [5/5] Initializing database schema...
backend\.venv\Scripts\python -c "import sys; sys.path.insert(0, 'backend'); from app.db import engine, Base; import app.models; Base.metadata.create_all(bind=engine); print('Database ready.')"
cd backend
.venv\Scripts\python -m alembic stamp head >nul 2>nul
cd ..

echo.
echo =========================================================
echo       RepoVision AI Installation Complete!
echo  To run the application, double-click run.bat
echo  To run verification tests, double-click test.bat
echo =========================================================
echo.
pause
