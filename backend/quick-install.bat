@echo off
echo 🐘 FlowTracker PostgreSQL Quick Installer
echo =========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Running as Administrator
) else (
    echo ❌ This script requires Administrator privileges
    echo 💡 Right-click this file and select "Run as administrator"
    pause
    exit /b 1
)

echo.
echo 📥 Downloading and installing PostgreSQL...
echo ⏳ This may take a few minutes...
echo.

REM Run the PowerShell installer
powershell -ExecutionPolicy Bypass -File "install-postgresql.ps1"

if %errorLevel% == 0 (
    echo.
    echo 🎉 Installation completed successfully!
    echo ✅ PostgreSQL is ready
    echo ✅ Database is configured
    echo ✅ Backend is ready to start
    echo.
    echo 🚀 Next steps:
    echo 1. Start backend: npm run dev
    echo 2. Test API: node test-backend.cjs
    echo 3. Open frontend: npm run dev (in project root)
) else (
    echo.
    echo ❌ Installation failed
    echo 💡 Please check the error messages above
)

echo.
pause
