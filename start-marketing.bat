@echo off
echo ==========================================
echo Starting OpenMTSciEd Marketing Website...
echo ==========================================

REM Check if Python is installed (using the configured path)
set PYTHON_PATH=G:\Python312\python.exe
if not exist "%PYTHON_PATH%" (
    echo Error: Python not found at %PYTHON_PATH%
    exit /b 1
)

REM Start Backend
echo [1/2] Starting FastAPI Backend...
start "OpenMTSciEd-Backend" cmd /k "cd /d %~dp0 && %PYTHON_PATH% -m uvicorn backend.openmtscied.main:app --reload --port 8000"

REM Wait for backend to start
timeout /t 3 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Angular Frontend...
start "OpenMTSciEd-Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo Services started!
echo - Backend: http://localhost:8000
echo - Frontend: http://localhost:5173 (or check console output)
echo ==========================================
