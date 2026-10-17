@echo off
REM DAWB Creative Studio - one-click local start for Windows.
REM Requires Node.js 20 or newer (https://nodejs.org). Double-click this file.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is not installed. Install the LTS version from https://nodejs.org and run this again.
  pause
  exit /b 1
)
if not exist node_modules (
  echo Installing dependencies - first run only, this takes a few minutes...
  call npm ci || call npm install
  if errorlevel 1 ( echo Install failed. & pause & exit /b 1 )
)
if not exist .next\BUILD_ID (
  echo Building the app - first run only...
  call npm run build
  if errorlevel 1 ( echo Build failed. & pause & exit /b 1 )
)
echo.
echo DAWB Creative Studio is starting at http://localhost:3000
echo Keep this window open while you work. Close it to stop the app.
start "" http://localhost:3000
call npm run start
