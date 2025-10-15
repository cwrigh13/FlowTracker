# FlowTracker Demo Launcher
# This script launches the demo environment from the demo directory

Write-Host "FlowTracker Demo Launcher" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host ""

# Check if demo directory exists
if (!(Test-Path "demo")) {
    Write-Host "Demo directory not found!" -ForegroundColor Red
    Write-Host "Please ensure the demo directory exists with demo scripts." -ForegroundColor Yellow
    exit 1
}

# Run the demo startup script
Write-Host "Launching demo from demo directory..." -ForegroundColor Yellow
& ".\demo\start-demo-simple.ps1"
