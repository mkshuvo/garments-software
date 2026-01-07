# Decrypt secrets and generate .env file (PowerShell version)
# Usage: .\scripts\decrypt-secrets.ps1

$ErrorActionPreference = "Stop"

Write-Host "Decrypting secrets..." -ForegroundColor Cyan

# Check SOPS is installed
$sopsPath = "sops"
if (-not (Get-Command sops -ErrorAction SilentlyContinue)) {
    $wingetSops = "$env:LOCALAPPDATA\Microsoft\WinGet\Packages\sops.exe"
    if (Test-Path $wingetSops) {
        $sopsPath = $wingetSops
    }
    else {
        Write-Host "sops not installed. Install with: winget install Mozilla.sops" -ForegroundColor Red
        exit 1
    }
}

# Check secrets file exists
if (-not (Test-Path "secrets.enc.yaml")) {
    Write-Host "secrets.enc.yaml not found!" -ForegroundColor Red
    Write-Host "   Create it with: sops -e secrets.yaml > secrets.enc.yaml" -ForegroundColor Yellow
    exit 1
}

# Decrypt and convert to .env
try {
    $decrypted = & $sopsPath -d --output-type json secrets.enc.yaml
    if ($LASTEXITCODE -ne 0) { throw "SOPS decryption failed with exit code $LASTEXITCODE" }
    
    # Check if python or python3 is available
    $pythonCmd = "python"
    if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
        if (Get-Command python3 -ErrorAction SilentlyContinue) {
            $pythonCmd = "python3"
        }
        else {
            throw "Python not found"
        }
    }
    
    $decrypted | & $pythonCmd scripts/yaml-to-env.py | Out-File -FilePath .env -Encoding utf8
}
catch {
    Write-Host "Decryption failed: $_" -ForegroundColor Red
    exit 1
}

# Generate pgadmin/pgpass from .env
# Read .env manually to avoid variable scope issues
$envContent = Get-Content .env
$envMap = @{}
foreach ($line in $envContent) {
    if ($line -match '^([^=]+)=(.*)$') {
        $envMap[$matches[1]] = $matches[2]
    }
}

# Create pgadmin directory if not exists
if (-not (Test-Path "pgadmin")) {
    New-Item -ItemType Directory -Force -Path pgadmin | Out-Null
}

# Generate pgpass file
$hostName = if ($envMap.ContainsKey("POSTGRES_HOST")) { $envMap["POSTGRES_HOST"] } else { "postgres" }
$user = $envMap["POSTGRES_USER"]
$pass = $envMap["POSTGRES_PASSWORD"]

if (-not $user -or -not $pass) {
    Write-Host "Warning: POSTGRES_USER or POSTGRES_PASSWORD not found in .env" -ForegroundColor Yellow
}

$pgpassContent = "${hostName}:5432:*:${user}:${pass}"
$pgpassContent | Out-File -FilePath pgadmin/pgpass -Encoding ascii -NoNewline

Write-Host "Secrets decrypted to .env" -ForegroundColor Green
Write-Host "pgadmin/pgpass generated" -ForegroundColor Green
