# Reset PostgreSQL password script
Write-Host "PostgreSQL Password Reset Helper" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green
Write-Host ""

# Check if PostgreSQL service is running
$service = Get-Service -Name "postgresql-x64-18" -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq "Running") {
    Write-Host "✅ PostgreSQL service is running" -ForegroundColor Green
} else {
    Write-Host "❌ PostgreSQL service is not running" -ForegroundColor Red
    Write-Host "Please start PostgreSQL service first" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "To reset the postgres password, you have a few options:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Use pgAdmin 4 (if installed):" -ForegroundColor Cyan
Write-Host "   - Open pgAdmin 4" -ForegroundColor White
Write-Host "   - Connect to localhost server" -ForegroundColor White
Write-Host "   - Right-click on 'postgres' user → Properties → Definition" -ForegroundColor White
Write-Host "   - Change password to 'postgres' (or your preferred password)" -ForegroundColor White
Write-Host ""
Write-Host "2. Use psql command line:" -ForegroundColor Cyan
Write-Host "   - Open Command Prompt as Administrator" -ForegroundColor White
Write-Host "   - Run: & 'C:\Program Files\PostgreSQL\18\bin\psql.exe' -U postgres" -ForegroundColor White
Write-Host "   - Enter: ALTER USER postgres PASSWORD 'postgres';" -ForegroundColor White
Write-Host "   - Enter: \q to quit" -ForegroundColor White
Write-Host ""
Write-Host "3. Use Windows Authentication (if enabled):" -ForegroundColor Cyan
Write-Host "   - This might work if you're logged in as the postgres user" -ForegroundColor White
Write-Host ""

# Try to connect with common passwords
Write-Host "Testing common passwords..." -ForegroundColor Yellow
$passwords = @("postgres", "admin", "password", "123456", "")

foreach ($pwd in $passwords) {
    try {
        $env:PGPASSWORD = $pwd
        $result = & "C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres -d postgres -c "SELECT 1;" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Success! Password is: '$pwd'" -ForegroundColor Green
            $env:PGPASSWORD = ""
            break
        }
    } catch {
        # Continue to next password
    }
}

$env:PGPASSWORD = ""

Write-Host ""
Write-Host "Once you have the password set, run: node test-postgres.js" -ForegroundColor Green
