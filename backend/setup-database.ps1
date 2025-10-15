# FlowTracker Database Setup Script
Write-Host "🐘 Setting up FlowTracker Database..." -ForegroundColor Green

# Check if PostgreSQL is installed
try {
    $psqlVersion = psql --version
    Write-Host "✅ PostgreSQL found: $psqlVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ PostgreSQL not found. Please install PostgreSQL first." -ForegroundColor Red
    Write-Host "📖 See POSTGRESQL_INSTALLATION_GUIDE.md for instructions" -ForegroundColor Yellow
    exit 1
}

# Test connection to postgres database
Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Yellow
try {
    $env:PGPASSWORD = "flowtracker2024"
    psql -h localhost -U postgres -d postgres -c "SELECT version();" | Out-Null
    Write-Host "✅ Connected to PostgreSQL successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to connect to PostgreSQL" -ForegroundColor Red
    Write-Host "💡 Make sure PostgreSQL is running and password is correct" -ForegroundColor Yellow
    exit 1
}

# Create flowtracker database
Write-Host "📊 Creating flowtracker database..." -ForegroundColor Yellow
try {
    psql -h localhost -U postgres -d postgres -c "CREATE DATABASE flowtracker;" 2>$null
    Write-Host "✅ Database 'flowtracker' created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database might already exist (this is OK)" -ForegroundColor Yellow
}

# Test connection to flowtracker database
Write-Host "🔍 Testing flowtracker database connection..." -ForegroundColor Yellow
try {
    psql -h localhost -U postgres -d flowtracker -c "SELECT current_database();" | Out-Null
    Write-Host "✅ Connected to flowtracker database successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to connect to flowtracker database" -ForegroundColor Red
    exit 1
}

# Run database migrations
Write-Host "🚀 Running database migrations..." -ForegroundColor Yellow
try {
    npm run migrate
    Write-Host "✅ Database migrations completed successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Database migrations failed" -ForegroundColor Red
    Write-Host "💡 Make sure you're in the backend directory and dependencies are installed" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Database setup complete!" -ForegroundColor Green
Write-Host "✅ PostgreSQL is running" -ForegroundColor Green
Write-Host "✅ flowtracker database created" -ForegroundColor Green
Write-Host "✅ Database schema applied" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next steps:" -ForegroundColor Cyan
Write-Host "1. Start the backend server: npm run dev" -ForegroundColor White
Write-Host "2. Test the API: node test-backend.cjs" -ForegroundColor White
Write-Host "3. Open frontend: npm run dev (in project root)" -ForegroundColor White
