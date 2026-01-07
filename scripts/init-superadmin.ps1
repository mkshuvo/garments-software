# Initialize super admin user (PowerShell version)
# Usage: .\scripts\init-superadmin.ps1

$ErrorActionPreference = "Stop"

Write-Host "Checking for super admin..." -ForegroundColor Cyan

# Wait for backend to be healthy
Write-Host "Waiting for backend to be healthy..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0

while ($attempt -lt $maxAttempts) {
    try {
        $null = Invoke-RestMethod -Uri "http://localhost:8080/api/health" -TimeoutSec 5
        Write-Host "Backend is healthy" -ForegroundColor Green
        break
    }
    catch {
        $attempt++
        Write-Host "   Attempt $attempt/$maxAttempts..."
        Start-Sleep -Seconds 5
    }
}

if ($attempt -eq $maxAttempts) {
    Write-Host "Backend did not become healthy in time" -ForegroundColor Red
    exit 1
}

# Load environment variables from .env
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
}

# Create super admin
Write-Host "Creating super admin..." -ForegroundColor Cyan

try {
    $body = @{
        Username = $env:SUPERADMIN_USERNAME
        Password = $env:SUPERADMIN_PASSWORD
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "http://localhost:8080/api/AdminSetup/create-admin" `
        -Method POST `
        -ContentType "application/json" `
        -Body $body

    Write-Host "Super admin created successfully!" -ForegroundColor Green
    Write-Host "   Username: $($env:SUPERADMIN_USERNAME)" -ForegroundColor White
}
catch {
    $statusCode = $_.Exception.Response.StatusCode.value__
    if ($statusCode -eq 409 -or $statusCode -eq 400) {
        Write-Host "Super admin already exists" -ForegroundColor Green
    }
    else {
        Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}
