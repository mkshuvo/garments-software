#!/bin/bash

# Development build script to demonstrate multi-stage caching benefits

echo "🚀 Building optimized development Docker image..."

# Build with cache optimization
echo "📦 Building with dependency caching..."
docker build \
  --file Dockerfile.dev \
  --target dependencies \
  --tag garments-backend-deps:latest \
  --cache-from garments-backend-deps:latest \
  .

echo "🔧 Building development stage..."
docker build \
  --file Dockerfile.dev \
  --target development \
  --tag garments-backend-dev:latest \
  --cache-from garments-backend-deps:latest \
  --cache-from garments-backend-dev:latest \
  .

echo "✅ Build complete!"
echo "🏷️  Tagged as: garments-backend-dev:latest"

# Show image sizes
echo "📊 Image information:"
docker images | grep garments-backend