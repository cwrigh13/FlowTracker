# FlowTracker Demo Environment Test Script
# This script tests if the demo environment is properly set up and running

Write-Host "🧪 Testing FlowTracker Demo Environment..." -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Green

$allTestsPassed = $true

# Test 1: Check if PostgreSQL is running
Write-Host "`n🔍 Test 1: PostgreSQL Connection" -ForegroundColor Yellow
try {
    $dbTest = psql -U postgres -h localhost -d flowtracker_demo -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ PostgreSQL is running and demo database is accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ PostgreSQL connection failed" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host "❌ PostgreSQL not found or not accessible" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 2: Check if demo data exists
Write-Host "`n🔍 Test 2: Demo Data Verification" -ForegroundColor Yellow
try {
    $libraryCount = psql -U postgres -h localhost -d flowtracker_demo -t -c "SELECT COUNT(*) FROM libraries WHERE code = 'DEMO';" 2>$null
    $userCount = psql -U postgres -h localhost -d flowtracker_demo -t -c "SELECT COUNT(*) FROM users WHERE email LIKE '%@demo.library.com';" 2>$null
    $issueCount = psql -U postgres -h localhost -d flowtracker_demo -t -c "SELECT COUNT(*) FROM issues;" 2>$null
    
    if ($libraryCount.Trim() -eq "1" -and $userCount.Trim() -eq "4" -and [int]$issueCount.Trim() -ge 5) {
        Write-Host "✅ Demo data is properly populated" -ForegroundColor Green
        Write-Host "   • Libraries: $($libraryCount.Trim())" -ForegroundColor White
        Write-Host "   • Demo Users: $($userCount.Trim())" -ForegroundColor White
        Write-Host "   • Issues: $($issueCount.Trim())" -ForegroundColor White
    } else {
        Write-Host "❌ Demo data is incomplete or missing" -ForegroundColor Red
        Write-Host "   • Libraries: $($libraryCount.Trim()) (expected: 1)" -ForegroundColor White
        Write-Host "   • Demo Users: $($userCount.Trim()) (expected: 4)" -ForegroundColor White
        Write-Host "   • Issues: $($issueCount.Trim()) (expected: ≥5)" -ForegroundColor White
        $allTestsPassed = $false
    }
} catch {
    Write-Host "❌ Failed to verify demo data" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 3: Check backend configuration
Write-Host "`n🔍 Test 3: Backend Configuration" -ForegroundColor Yellow
if (Test-Path "backend\.env") {
    $envContent = Get-Content "backend\.env" -Raw
    if ($envContent -match "DEMO_MODE=true" -and $envContent -match "flowtracker_demo") {
        Write-Host "✅ Backend demo configuration is correct" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend demo configuration is incorrect" -ForegroundColor Red
        $allTestsPassed = $false
    }
} else {
    Write-Host "❌ Backend .env file not found" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 4: Check if dependencies are installed
Write-Host "`n🔍 Test 4: Dependencies" -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ Frontend dependencies are installed" -ForegroundColor Green
} else {
    Write-Host "❌ Frontend dependencies not installed" -ForegroundColor Red
    $allTestsPassed = $false
}

if (Test-Path "backend\node_modules") {
    Write-Host "✅ Backend dependencies are installed" -ForegroundColor Green
} else {
    Write-Host "❌ Backend dependencies not installed" -ForegroundColor Red
    $allTestsPassed = $false
}

# Test 5: Check if backend can be built
Write-Host "`n🔍 Test 5: Backend Build" -ForegroundColor Yellow
Set-Location backend
try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backend builds successfully" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend build failed" -ForegroundColor Red
        Write-Host "Build output: $buildOutput" -ForegroundColor Red
        $allTestsPassed = $false
    }
} catch {
    Write-Host "❌ Backend build test failed" -ForegroundColor Red
    $allTestsPassed = $false
}
Set-Location ..

# Test 6: Check if ports are available
Write-Host "`n🔍 Test 6: Port Availability" -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$port3001 = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue

if (-not $port3000) {
    Write-Host "✅ Port 3000 (frontend) is available" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 3000 (frontend) is in use" -ForegroundColor Yellow
}

if (-not $port3001) {
    Write-Host "✅ Port 3001 (backend) is available" -ForegroundColor Green
} else {
    Write-Host "⚠️  Port 3001 (backend) is in use" -ForegroundColor Yellow
}

# Test 7: Check demo files exist
Write-Host "`n🔍 Test 7: Demo Files" -ForegroundColor Yellow
$demoFiles = @(
    "src\config\demo.ts",
    "src\components\DemoBanner.tsx",
    "src\components\DemoQuickLogin.tsx",
    "setup-demo-environment.ps1",
    "start-demo.ps1",
    "DEMO_SETUP_GUIDE.md"
)

$missingFiles = @()
foreach ($file in $demoFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file exists" -ForegroundColor Green
    } else {
        Write-Host "❌ $file is missing" -ForegroundColor Red
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    $allTestsPassed = $false
}

# Final Results
Write-Host "`n📊 Test Results Summary" -ForegroundColor Cyan
Write-Host "========================" -ForegroundColor Cyan

if ($allTestsPassed) {
    Write-Host "🎉 All tests passed! Demo environment is ready." -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 To start the demo environment:" -ForegroundColor Yellow
    Write-Host "   .\start-demo.ps1" -ForegroundColor White
    Write-Host ""
    Write-Host "📱 Then open: http://localhost:3000" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "👥 Demo users (password: demo123):" -ForegroundColor Yellow
    Write-Host "   • admin@demo.library.com" -ForegroundColor White
    Write-Host "   • manager@demo.library.com" -ForegroundColor White
    Write-Host "   • staff@demo.library.com" -ForegroundColor White
    Write-Host "   • viewer@demo.library.com" -ForegroundColor White
} else {
    Write-Host "❌ Some tests failed. Demo environment needs attention." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 To fix issues:" -ForegroundColor Yellow
    Write-Host "   1. Run setup-demo-environment.ps1 to set up the environment" -ForegroundColor White
    Write-Host "   2. Check the DEMO_SETUP_GUIDE.md for troubleshooting" -ForegroundColor White
    Write-Host "   3. Ensure PostgreSQL is running and accessible" -ForegroundColor White
    Write-Host "   4. Verify all dependencies are installed" -ForegroundColor White
}

Write-Host ""
Write-Host "📚 For more information, see DEMO_SETUP_GUIDE.md" -ForegroundColor Cyan
