@echo off
TITLE SentinelAI Residential CCTV Security Launcher
COLOR 0A
cls

echo =======================================================================
echo              SENTINEL AI: SMARTER CCTV. FASTER RESPONSE.
echo               Windows Prototype Automatic Startup Script
echo =======================================================================
echo.

REM 1. Check Python installation
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.11+ is not installed or not in system PATH!
    echo Please install Python 3.11+ from https://www.python.org/
    pause
    exit /b 1
)
echo [OK] Python detected.

REM 2. Check Node.js installation
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in system PATH!
    echo Please install Node.js 20+ from https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js detected.

echo.
echo -----------------------------------------------------------------------
echo [1/4] Setting up Python Virtual Environment (backend\venv)...
echo -----------------------------------------------------------------------
if not exist "backend\venv" (
    python -m venv backend\venv
    echo Created Python virtual environment at backend\venv
)

call backend\venv\Scripts\activate.bat

echo.
echo -----------------------------------------------------------------------
echo [2/4] Installing Python Backend Dependencies...
echo -----------------------------------------------------------------------
python -m pip install --upgrade pip
pip install -r backend\requirements.txt

echo.
echo -----------------------------------------------------------------------
echo [3/4] Generating Synthetic Demo Video & Seeding SQLite Database...
echo -----------------------------------------------------------------------
python backend\generate_demo_video.py
python backend\seed_demo.py

echo.
echo -----------------------------------------------------------------------
echo [4/4] Installing Node.js Frontend Dependencies...
echo -----------------------------------------------------------------------
cmd /c "cd frontend && npm install"

echo.
echo =======================================================================
echo          LAUNCHING SENTINEL AI BACKEND & FRONTEND SERVERS...
echo =======================================================================
echo   - Backend API & WebSockets: http://localhost:8000
echo   - Guard SOC Frontend UI:    http://localhost:3000
echo   - OpenAPI Interactive Docs: http://localhost:8000/docs
echo =======================================================================
echo.

REM Launch FastAPI Backend in a separate window
start "SentinelAI FastAPI Backend (Port 8000)" cmd /k "call backend\venv\Scripts\activate.bat && cd backend && uvicorn app.main:app --reload --host 0.0.0.0 --port 8000"

REM Launch Next.js Frontend in current window
cd frontend
cmd /c "npm run dev"

pause
