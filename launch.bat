@echo off
title SightReading Tool
cd /d "%~dp0"

echo ===================================================
echo             SightReading Practice Tool
echo ===================================================
echo.
echo Starting SightReading development server...
echo The application will open automatically in your browser.
echo Keep this terminal window open while using the app.
echo.
echo To quit, simply close this window.
echo ===================================================
echo.

call npm run dev

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] The server stopped unexpectedly.
    pause
)
