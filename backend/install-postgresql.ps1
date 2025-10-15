# FlowTracker PostgreSQL Auto-Installer
# This script will download and install PostgreSQL automatically

Write-Host "🐘 FlowTracker PostgreSQL Auto-Installer" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "❌ This script requires Administrator privileges" -ForegroundColor Red
    Write-Host "💡 Right-click PowerShell and select 'Run as Administrator'" -ForegroundColor Yellow
    Write-Host "   Then run: .\install-postgresql.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Running as Administrator" -ForegroundColor Green

# Check if PostgreSQL is already installed
try {
    $psqlVersion = psql --version 2>$null
    if ($psqlVersion) {
        Write-Host "✅ PostgreSQL is already installed: $psqlVersion" -ForegroundColor Green
        Write-Host "🚀 Proceeding with database setup..." -ForegroundColor Yellow
        & .\setup-database.ps1
        exit 0
    }
} catch {
    Write-Host "📥 PostgreSQL not found, proceeding with installation..." -ForegroundColor Yellow
}

# Download PostgreSQL installer
Write-Host "📥 Downloading PostgreSQL installer..." -ForegroundColor Yellow

$downloadUrl = "https://get.enterprisedb.com/postgresql/postgresql-16.4-1-windows-x64.exe"
$installerPath = "$env:TEMP\postgresql-installer.exe"

try {
    Write-Host "🔗 Downloading from: $downloadUrl" -ForegroundColor Cyan
    Invoke-WebRequest -Uri $downloadUrl -OutFile $installerPath -UseBasicParsing
    Write-Host "✅ Download completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Download failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Please download manually from: https://www.postgresql.org/download/windows/" -ForegroundColor Yellow
    exit 1
}

# Install PostgreSQL silently
Write-Host "🔧 Installing PostgreSQL..." -ForegroundColor Yellow

$installArgs = @(
    "--mode", "unattended",
    "--unattendedmodeui", "none",
    "--superpassword", "flowtracker2024",
    "--servicename", "postgresql",
    "--serviceaccount", "postgres",
    "--servicepassword", "flowtracker2024",
    "--serverport", "5432",
    "--enable-components", "server,pgAdmin,commandlinetools",
    "--disable-components", "stackbuilder"
)

try {
    Write-Host "⚙️  Running installer with silent mode..." -ForegroundColor Cyan
    Start-Process -FilePath $installerPath -ArgumentList $installArgs -Wait -NoNewWindow
    Write-Host "✅ PostgreSQL installation completed" -ForegroundColor Green
} catch {
    Write-Host "❌ Installation failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Please run the installer manually" -ForegroundColor Yellow
    exit 1
}

# Add PostgreSQL to PATH
Write-Host "🔧 Adding PostgreSQL to PATH..." -ForegroundColor Yellow
$postgresPath = "C:\Program Files\PostgreSQL\16\bin"
$currentPath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
if ($currentPath -notlike "*$postgresPath*") {
    [Environment]::SetEnvironmentVariable("PATH", "$currentPath;$postgresPath", "Machine")
    Write-Host "✅ PostgreSQL added to PATH" -ForegroundColor Green
} else {
    Write-Host "✅ PostgreSQL already in PATH" -ForegroundColor Green
}

# Refresh environment variables
$env:PATH = [Environment]::GetEnvironmentVariable("PATH", "Machine")

# Wait for PostgreSQL service to start
Write-Host "⏳ Waiting for PostgreSQL service to start..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Test connection
Write-Host "🔍 Testing PostgreSQL connection..." -ForegroundColor Yellow
$maxRetries = 5
$retryCount = 0

do {
    try {
        $env:PGPASSWORD = "flowtracker2024"
        psql -h localhost -U postgres -d postgres -c "SELECT version();" | Out-Null
        Write-Host "✅ PostgreSQL is running and accessible" -ForegroundColor Green
        break
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Host "⏳ Retrying connection... ($retryCount/$maxRetries)" -ForegroundColor Yellow
            Start-Sleep -Seconds 5
        } else {
            Write-Host "❌ Could not connect to PostgreSQL after $maxRetries attempts" -ForegroundColor Red
            Write-Host "💡 Please check if PostgreSQL service is running" -ForegroundColor Yellow
            exit 1
        }
    }
} while ($retryCount -lt $maxRetries)

# Create flowtracker database
Write-Host "📊 Creating flowtracker database..." -ForegroundColor Yellow
try {
    psql -h localhost -U postgres -d postgres -c "CREATE DATABASE flowtracker;" 2>$null
    Write-Host "✅ Database 'flowtracker' created successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database might already exist (this is OK)" -ForegroundColor Yellow
}

# Clean up installer
Write-Host "🧹 Cleaning up installer..." -ForegroundColor Yellow
Remove-Item $installerPath -Force -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "🎉 PostgreSQL installation completed successfully!" -ForegroundColor Green
Write-Host "✅ PostgreSQL 16 installed" -ForegroundColor Green
Write-Host "✅ flowtracker database created" -ForegroundColor Green
Write-Host "✅ Password set to: flowtracker2024" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Running database setup..." -ForegroundColor Cyan

# Run database setup
& .\setup-database.ps1
