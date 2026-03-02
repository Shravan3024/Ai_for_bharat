@echo off
echo ==========================================
echo       LEXILEARN - PROJECT STARTUP
echo ==========================================

echo [1/4] Checking dependencies...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH.
    pause
    exit /b 1
)

bun --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [INFO] Bun not found, trying npm...
    npm --version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ERROR: Neither Bun nor Node/NPM are installed.
        pause
        exit /b 1
    )
    set RUNTIME=npm
) else (
    set RUNTIME=bun
)

echo [2/4] Installing backend dependencies...
pip install -r server/requirements.txt
if %errorlevel% neq 0 (
    echo [WARNING] Backend installation failed. Check your Python environment.
)

echo [3/4] Installing frontend dependencies...
if "%RUNTIME%"=="bun" (
    bun install
) else (
    npm install
)

echo [4/4] Starting project (Backend + Frontend)...
if "%RUNTIME%"=="bun" (
    bun run start-all
) else (
    npm run start-all
)

pause
