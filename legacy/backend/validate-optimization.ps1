# Script to validate Docker optimization benefits

Write-Host "🔍 Validating Docker optimization..." -ForegroundColor Green

# Function to measure build time
function Measure-BuildTime {
    param($BuildCommand, $Description)
    
    Write-Host "⏱️  Measuring: $Description" -ForegroundColor Yellow
    $stopwatch = [System.Diagnostics.Stopwatch]::StartNew()
    
    Invoke-Expression $BuildCommand
    
    $stopwatch.Stop()
    $elapsed = $stopwatch.Elapsed.TotalSeconds
    
    Write-Host "⏰ $Description took: $([math]::Round($elapsed, 2)) seconds" -ForegroundColor Cyan
    return $elapsed
}

# Test 1: Clean build (no cache)
Write-Host "`n🧹 Test 1: Clean build (no cache)" -ForegroundColor Magenta
docker system prune -f --volumes 2>$null
docker rmi garments-backend-deps:latest 2>$null
docker rmi garments-backend-dev:latest 2>$null

$cleanBuildTime = Measure-BuildTime "docker build --file Dockerfile.dev --target development --tag garments-backend-dev:latest --no-cache ." "Clean build"

# Test 2: Cached build (dependencies unchanged)
Write-Host "`n📦 Test 2: Cached build (dependencies unchanged)" -ForegroundColor Magenta
$cachedBuildTime = Measure-BuildTime "docker build --file Dockerfile.dev --target development --tag garments-backend-dev:latest ." "Cached build"

# Test 3: Source code change simulation
Write-Host "`n🔄 Test 3: Source code change simulation" -ForegroundColor Magenta
# Create a temporary file to simulate source change
$tempFile = "temp_validation_file.txt"
"Validation timestamp: $(Get-Date)" | Out-File $tempFile

$sourceChangeBuildTime = Measure-BuildTime "docker build --file Dockerfile.dev --target development --tag garments-backend-dev:latest ." "Source change build"

# Cleanup
Remove-Item $tempFile -ErrorAction SilentlyContinue

# Results
Write-Host "`n📊 OPTIMIZATION RESULTS:" -ForegroundColor Green
Write-Host "Clean build time:        $([math]::Round($cleanBuildTime, 2))s" -ForegroundColor White
Write-Host "Cached build time:       $([math]::Round($cachedBuildTime, 2))s" -ForegroundColor White
Write-Host "Source change build:     $([math]::Round($sourceChangeBuildTime, 2))s" -ForegroundColor White

$cacheImprovement = (($cleanBuildTime - $cachedBuildTime) / $cleanBuildTime) * 100
$sourceImprovement = (($cleanBuildTime - $sourceChangeBuildTime) / $cleanBuildTime) * 100

Write-Host "`n🎯 PERFORMANCE GAINS:" -ForegroundColor Green
Write-Host "Cache improvement:       $([math]::Round($cacheImprovement, 1))%" -ForegroundColor Cyan
Write-Host "Source change benefit:   $([math]::Round($sourceImprovement, 1))%" -ForegroundColor Cyan

# Validate multi-stage structure
Write-Host "`n🏗️  MULTI-STAGE VALIDATION:" -ForegroundColor Green
$stages = docker history garments-backend-dev:latest --format "table {{.CreatedBy}}" | Select-String "FROM"
Write-Host "Detected stages: $($stages.Count)" -ForegroundColor White

if ($stages.Count -ge 3) {
    Write-Host "✅ Multi-stage build confirmed!" -ForegroundColor Green
} else {
    Write-Host "⚠️  Multi-stage build may not be optimal" -ForegroundColor Yellow
}

Write-Host "`n✅ Validation complete!" -ForegroundColor Green