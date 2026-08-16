@echo off
setlocal
cd /d "%~dp0"

echo Installing project dependencies if needed...
call npm install
if errorlevel 1 (
  echo.
  echo npm install failed. Make sure Node.js is installed.
  pause
  exit /b 1
)

echo.
echo Starting LittleBear...
call npm run dev
