@echo off
chcp 65001 >nul
echo ============================================================
echo iMato Backend Service
echo ============================================================
echo.

cd backend
if not exist "venv" (
    echo Creating Python venv...
    G:\Python312\python -m venv venv
)

call venv\Scripts\activate
G:\Python312\python -m pip install -q -r requirements.txt

echo Starting Backend API...
echo URL: http://localhost:8000
echo Docs: http://localhost:8000/docs
echo.
G:\Python312\python main.py
