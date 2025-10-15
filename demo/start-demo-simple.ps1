# FlowTracker Simple Demo Startup Script
# This script starts both the backend and frontend for the mock demo environment

Write-Host "Starting FlowTracker Simple Demo Environment..." -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green

# Navigate to project root
$projectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $projectRoot

# Check if demo environment is set up
if (!(Test-Path "backend\.env")) {
    Write-Host "Demo environment not set up. Please run setup-demo-simple.ps1 first." -ForegroundColor Red
    exit 1
}

# Start backend in new PowerShell window
Write-Host "Starting backend server (Mock Mode)..." -ForegroundColor Yellow
$backendScript = @"
Set-Location '$projectRoot\backend'
Write-Host "Starting FlowTracker Backend (Mock Demo Mode)..." -ForegroundColor Green
npm run dev
"@

$backendScript | Out-File -FilePath "$projectRoot\temp_backend.ps1" -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$projectRoot\temp_backend.ps1"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Start frontend in new PowerShell window
Write-Host "Starting frontend development server..." -ForegroundColor Yellow
$frontendScript = @"
Set-Location '$projectRoot'
Write-Host "Starting FlowTracker Frontend (Demo Mode)..." -ForegroundColor Green
npm run dev
"@

$frontendScript | Out-File -FilePath "$projectRoot\temp_frontend.ps1" -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "$projectRoot\temp_frontend.ps1"

# Wait a moment for frontend to start
Start-Sleep -Seconds 2

# Clean up temp files
Remove-Item "$projectRoot\temp_backend.ps1" -ErrorAction SilentlyContinue
Remove-Item "$projectRoot\temp_frontend.ps1" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "Demo Environment Started!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Health Check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "Demo Users (password: demo123):" -ForegroundColor Yellow
Write-Host "• admin@demo.library.com (Admin)" -ForegroundColor White
Write-Host "• manager@demo.library.com (Manager)" -ForegroundColor White
Write-Host "• staff@demo.library.com (Staff)" -ForegroundColor White
Write-Host "• viewer@demo.library.com (Viewer)" -ForegroundColor White
Write-Host ""
Write-Host "Tips:" -ForegroundColor Yellow
Write-Host "• Try logging in as different users to see role-based features" -ForegroundColor White
Write-Host "• Create new issues and drag them between columns" -ForegroundColor White
Write-Host "• Check out the admin panel for user management" -ForegroundColor White
Write-Host "• All demo data is pre-populated for immediate testing" -ForegroundColor White
Write-Host ""
Write-Host "This demo uses mock data - no database required!" -ForegroundColor Green
Write-Host ""
Write-Host "To stop the demo: Close both PowerShell windows or press Ctrl+C" -ForegroundColor Red
Write-Host ""
Write-Host "Opening browser in 5 seconds..." -ForegroundColor Green

# Wait and open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
