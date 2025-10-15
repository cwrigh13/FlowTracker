# FlowTracker Demo Setup Launcher
# This script launches the demo setup from the demo directory

Write-Host "FlowTracker Demo Setup Launcher" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Check if demo directory exists
if (!(Test-Path "demo")) {
    Write-Host "Demo directory not found!" -ForegroundColor Red
    Write-Host "Please ensure the demo directory exists with demo scripts." -ForegroundColor Yellow
    exit 1
}

Write-Host "Choose demo setup option:" -ForegroundColor Cyan
Write-Host "1. Simple Demo (No Database - Recommended)" -ForegroundColor White
Write-Host "2. Full Demo (Requires PostgreSQL)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host ""
        Write-Host "Running simple demo setup..." -ForegroundColor Yellow
        & ".\demo\setup-demo-simple.ps1"
    }
    "2" {
        Write-Host ""
        Write-Host "Running full demo setup..." -ForegroundColor Yellow
        & ".\demo\setup-demo-environment.ps1"
    }
    default {
        Write-Host ""
        Write-Host "Invalid choice. Please run again and select 1 or 2." -ForegroundColor Red
        exit 1
    }
}
