# FlowTracker Demo Startup Script
# This script starts both the backend and frontend for the demo environment

Write-Host "🚀 Starting FlowTracker Demo Environment..." -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Check if demo environment is set up
if (!(Test-Path "backend\.env")) {
    Write-Host "❌ Demo environment not set up. Please run setup-demo-environment.ps1 first." -ForegroundColor Red
    exit 1
}

# Check if database exists and is accessible
Write-Host "🔍 Checking database connection..." -ForegroundColor Yellow
try {
    $dbCheck = psql -U postgres -h localhost -d flowtracker_demo -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Database connection failed. Please ensure PostgreSQL is running and demo database exists." -ForegroundColor Red
        Write-Host "Run setup-demo-environment.ps1 to set up the database." -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ Database connection successful" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found or not accessible." -ForegroundColor Red
    Write-Host "Please ensure PostgreSQL is installed and running." -ForegroundColor Yellow
    exit 1
}

# Start backend in new PowerShell window
Write-Host "🔧 Starting backend server..." -ForegroundColor Yellow
$backendScript = @"
Set-Location backend
Write-Host "🚀 Starting FlowTracker Backend (Demo Mode)..." -ForegroundColor Green
npm run dev
"@

$backendScript | Out-File -FilePath "temp_backend.ps1" -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "temp_backend.ps1"

# Wait a moment for backend to start
Start-Sleep -Seconds 3

# Check if backend is running
Write-Host "🔍 Checking backend health..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 5
    if ($healthCheck.status -eq "OK") {
        Write-Host "✅ Backend is running and healthy" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Backend started but health check failed" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️  Backend may still be starting up..." -ForegroundColor Yellow
}

# Start frontend in new PowerShell window
Write-Host "🎨 Starting frontend development server..." -ForegroundColor Yellow
$frontendScript = @"
Write-Host "🎨 Starting FlowTracker Frontend (Demo Mode)..." -ForegroundColor Green
npm run dev
"@

$frontendScript | Out-File -FilePath "temp_frontend.ps1" -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-ExecutionPolicy", "Bypass", "-File", "temp_frontend.ps1"

# Wait a moment for frontend to start
Start-Sleep -Seconds 2

# Clean up temp files
Remove-Item "temp_backend.ps1" -ErrorAction SilentlyContinue
Remove-Item "temp_frontend.ps1" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 Demo Environment Started!" -ForegroundColor Green
Write-Host "============================" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🔧 Backend API: http://localhost:3001" -ForegroundColor Cyan
Write-Host "💚 Health Check: http://localhost:3001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "👥 Demo Users (password: demo123):" -ForegroundColor Yellow
Write-Host "• admin@demo.library.com (Admin)" -ForegroundColor White
Write-Host "• manager@demo.library.com (Manager)" -ForegroundColor White
Write-Host "• staff@demo.library.com (Staff)" -ForegroundColor White
Write-Host "• viewer@demo.library.com (Viewer)" -ForegroundColor White
Write-Host ""
Write-Host "💡 Tips:" -ForegroundColor Yellow
Write-Host "• Try logging in as different users to see role-based features" -ForegroundColor White
Write-Host "• Create new issues and drag them between columns" -ForegroundColor White
Write-Host "• Check out the admin panel for user management" -ForegroundColor White
Write-Host "• All demo data is pre-populated for immediate testing" -ForegroundColor White
Write-Host ""
Write-Host "🛑 To stop the demo: Close both PowerShell windows or press Ctrl+C" -ForegroundColor Red
Write-Host ""
Write-Host "Opening browser in 5 seconds..." -ForegroundColor Green

# Wait and open browser
Start-Sleep -Seconds 5
Start-Process "http://localhost:3000"
