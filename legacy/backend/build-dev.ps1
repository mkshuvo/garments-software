# Development build script to demonstrate multi-stage caching benefits

Write-Host "🚀 Building optimized development Docker image..." -ForegroundColor Green

# Build with cache optimization
Write-Host "📦 Building with dependency caching..." -ForegroundColor Yellow
docker build `
  --file Dockerfile.dev `
  --target dependencies `
  --tag garments-backend-deps:latest `
  --cache-from garments-backend-deps:latest `
  .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Dependency stage build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "🔧 Building development stage..." -ForegroundColor Yellow
docker build `
  --file Dockerfile.dev `
  --target development `
  --tag garments-backend-dev:latest `
  --cache-from garments-backend-deps:latest `
  --cache-from garments-backend-dev:latest `
  .

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Development stage build failed!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build complete!" -ForegroundColor Green
Write-Host "🏷️  Tagged as: garments-backend-dev:latest" -ForegroundColor Cyan

# Show image sizes
Write-Host "📊 Image information:" -ForegroundColor Blue
docker images | Select-String "garments-backend"