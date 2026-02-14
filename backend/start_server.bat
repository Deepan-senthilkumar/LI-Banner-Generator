@echo off
echo ==========================================
echo   LinkedIn Banner Studio - Backend Server
echo ==========================================
echo.

cd /d "%~dp0"

:: Check for virtual environment
if not exist "venv" (
    echo [1/3] Creating virtual environment...
    python -m venv venv
    if %ERRORLEVEL% NEQ 0 (
        echo.
        echo [ERROR] Failed to create virtual environment!
        pause
        exit /b %ERRORLEVEL%
    )
)

echo [2/3] Activating virtual environment...
call venv\Scripts\activate

echo [3/3] Installing dependencies...
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to install dependencies!
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo Starting Server...
echo API Documentation available at: http://localhost:8000/docs
echo.
python -m app.main

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Server crashed or failed to start.
    pause
)
