#!/bin/bash
# Initialize super admin user
set -e

echo "👤 Checking for super admin..."

# Wait for backend to be healthy
echo "⏳ Waiting for backend to be healthy..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
    if curl -sf http://localhost:8080/api/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
        break
    fi
    attempt=$((attempt + 1))
    echo "   Attempt $attempt/$max_attempts..."
    sleep 5
done

if [ $attempt -eq $max_attempts ]; then
    echo "❌ Backend did not become healthy in time"
    exit 1
fi

# Load environment variables
if [ -f .env ]; then
    export $(grep -v '^#' .env | xargs)
fi

# Create super admin
echo "🔧 Creating super admin..."
response=$(curl -s -X POST "http://localhost:8080/api/AdminSetup/create-admin" \
    -H "Content-Type: application/json" \
    -d "{\"Username\":\"${SUPERADMIN_USERNAME}\",\"Password\":\"${SUPERADMIN_PASSWORD}\"}" \
    -w "\n%{http_code}")

http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | head -n -1)

if [ "$http_code" = "200" ] || [ "$http_code" = "201" ]; then
    echo "✅ Super admin created successfully!"
    echo "   Username: ${SUPERADMIN_USERNAME}"
elif [ "$http_code" = "409" ] || [ "$http_code" = "400" ]; then
    echo "✅ Super admin already exists"
else
    echo "⚠️  Response: $body (HTTP $http_code)"
fi
