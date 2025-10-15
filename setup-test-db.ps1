# PowerShell script to set up test database
Write-Host "🔧 Setting up FlowTracker test database..." -ForegroundColor Blue

# Check if PostgreSQL is running
try {
    $pgProcess = Get-Process -Name "postgres" -ErrorAction SilentlyContinue
    if (-not $pgProcess) {
        Write-Host "❌ PostgreSQL is not running. Please start PostgreSQL first." -ForegroundColor Red
        Write-Host "You can start it using: net start postgresql-x64-13" -ForegroundColor Yellow
        exit 1
    }
    Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
} catch {
    Write-Host "❌ Could not check PostgreSQL status" -ForegroundColor Red
    exit 1
}

# Navigate to backend directory
Set-Location -Path "backend"

# Run the database setup script
Write-Host "📊 Creating test database..." -ForegroundColor Blue
node create-test-db.js

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Test database setup complete!" -ForegroundColor Green
    Write-Host "🧪 You can now run tests with: npm test" -ForegroundColor Blue
} else {
    Write-Host "❌ Test database setup failed" -ForegroundColor Red
    exit 1
}

# Go back to root directory
Set-Location -Path ".."
