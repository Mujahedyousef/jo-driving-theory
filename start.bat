@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies, this happens once...
  call npm install
)
echo Starting the app on http://localhost:5173 (close this window to stop)
call npm run dev -- --open
