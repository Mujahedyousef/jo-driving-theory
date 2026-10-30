@echo off
chcp 65001 >nul
:: Asks for administrator permission, then installs the Arabic (Saudi Arabia) voice.
net session >nul 2>&1
if %errorlevel% neq 0 (
  echo Requesting administrator permission...
  powershell -NoProfile -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-saudi-voice.ps1"
echo.
pause
