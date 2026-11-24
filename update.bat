
@echo off
title CLEARSTEP Update

echo ====================================
echo       CLEARSTEP DEVELOPMENT
echo ====================================

cd /d "%~dp0"

echo.
echo Checking dependencies...
call npm install

if errorlevel 1 (
    echo Dependency installation failed.
    pause
    exit /b 1
)

echo.
echo Checking TypeScript and production build...
call npm run build

if errorlevel 1 (
    echo Build failed. Fix errors before publishing.
    pause
    exit /b 1
)

echo.
echo ====================================
echo       BUILD SUCCESSFUL
echo ====================================
echo.
echo Starting development server...
call npm run dev

pause
