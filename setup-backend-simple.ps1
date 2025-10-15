# FlowTracker Backend Setup Script for Windows
Write-Host "Setting up FlowTracker Backend..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "Node.js found: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js 16+ first." -ForegroundColor Red
    exit 1
}

# Check if PostgreSQL is installed
try {
    $psqlVersion = psql --version
    Write-Host "PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "PostgreSQL is not installed. Please install PostgreSQL 12+ first." -ForegroundColor Red
    exit 1
}

Write-Host "Prerequisites check passed" -ForegroundColor Green

# Navigate to backend directory
Set-Location backend

# Install dependencies
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

# Create .env file if it doesn't exist
if (!(Test-Path .env)) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    Copy-Item env.example .env
    Write-Host "Please edit .env file with your database credentials" -ForegroundColor Yellow
}

# Build TypeScript
Write-Host "Building TypeScript..." -ForegroundColor Yellow
npm run build

Write-Host "Backend setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Edit backend\.env with your database credentials" -ForegroundColor White
Write-Host "2. Create PostgreSQL database: createdb flowtracker" -ForegroundColor White
Write-Host "3. Run migrations: cd backend; npm run migrate" -ForegroundColor White
Write-Host "4. Start development server: cd backend; npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "API will be available at: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Health check: http://localhost:3001/health" -ForegroundColor Cyan
