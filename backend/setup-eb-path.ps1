# Quick script to add EB CLI to PATH for current PowerShell session
# Run this if 'eb' command is not found

$pythonScripts = "C:\Users\cwrig\AppData\Local\Programs\Python\Python311\Scripts"

if ($env:Path -notlike "*$pythonScripts*") {
    $env:Path += ";$pythonScripts"
    Write-Host "✅ EB CLI added to PATH for this session" -ForegroundColor Green
} else {
    Write-Host "✅ EB CLI already in PATH" -ForegroundColor Green
}

Write-Host "`nTesting eb command..." -ForegroundColor Cyan
eb --version

Write-Host "`n🚀 Ready to use 'eb' commands!" -ForegroundColor Green

