# PowerShell script to start backend server with error checking

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend Server" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to backend directory
$backendPath = "apps\backend"
if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Error: Backend directory not found!" -ForegroundColor Red
    Write-Host "   Expected path: $backendPath" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
    pause
    exit
}

Set-Location $backendPath
Write-Host "📁 Current directory: $(Get-Location)" -ForegroundColor Green
Write-Host ""

# Check for .env file
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  WARNING: .env file not found!" -ForegroundColor Yellow
    Write-Host "   The server may fail to start without environment variables." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Create .env file from env.example:" -ForegroundColor Yellow
    Write-Host "   copy env.example .env" -ForegroundColor White
    Write-Host ""
    Write-Host "   Then edit .env and add your Supabase credentials." -ForegroundColor Yellow
    Write-Host ""
    $continue = Read-Host "Continue anyway? (y/n)"
    if ($continue -ne "y") {
        exit
    }
}

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "⚠️  Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Start the server
Write-Host "🚀 Starting backend server..." -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "IMPORTANT: Keep this window open!" -ForegroundColor Yellow
Write-Host "The server must stay running." -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

npm run dev

