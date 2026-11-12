@echo off
setlocal

echo =========================================================
echo       RepoVision AI - Full Test & Verification Suite
echo =========================================================
echo.

:: Ensure venv exists
if not exist "backend\.venv\Scripts\python.exe" (
    echo [ERROR] Virtual environment not found. Please run install.bat first.
    pause
    exit /b 1
)

:: 1. Backend Pytest
echo [1/3] Running Backend Pytest Suite...
backend\.venv\Scripts\python -m pytest backend\tests
if %errorlevel% neq 0 (
    echo [FAIL] Backend tests failed!
    pause
    exit /b 1
)
echo [PASS] All backend unit and integration tests passed!
echo.

:: 2. Frontend Build
echo [2/3] Running Frontend Type Check and Production Build...
call npm run build
if %errorlevel% neq 0 (
    echo [FAIL] Frontend build failed!
    pause
    exit /b 1
)
echo [PASS] Frontend build verified cleanly!
echo.

:: 3. Playwright E2E Browser Automation
echo [3/3] Running Playwright E2E Browser Automation Verification...
backend\.venv\Scripts\python scripts\e2e_verify.py
if %errorlevel% neq 0 (
    echo [FAIL] Playwright E2E tests failed!
    pause
    exit /b 1
)
echo [PASS] 200%% Verified: End-to-end browser automation completed successfully!
echo.

echo =========================================================
echo  ALL TESTS PASSED! Application is 200%% verified & working.
echo =========================================================
echo.
pause
