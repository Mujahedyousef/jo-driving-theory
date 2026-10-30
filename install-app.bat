@echo off
chcp 65001 >nul
cd /d "%~dp0"
if not exist node_modules (
  echo Installing dependencies, this happens once...
  call npm install
)
echo Building the offline version...
call npm run build
echo.
echo Open http://localhost:4173 in Chrome or Edge, then use "Install app" from the address bar.
echo After the first visit the site works without internet. Close this window to stop.
call npx vite preview --open
