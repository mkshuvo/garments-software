# GarmentsERP Makefile
# Professional admin creation and development utilities

.PHONY: help superuser build run clean test migrate restore docker-build docker-up docker-down docker-dev docker-dev-detached docker-dev-hot docker-dev-rebuild backend-build-dev backend-validate dev-status dev-logs dev-clean dev-reset podman-build podman-up podman-down podman-dev podman-dev-verbose podman-dev-hot podman-dev-rebuild podman-dev-status podman-dev-logs podman-dev-clean podman-dev-reset superuser-help

# Default target
help:
	@echo "GarmentsERP Makefile Commands:"
	@echo ""
	@echo "Admin Management:"
	@echo "  make superuser -u <username> -p <password>  Create a super admin user"
	@echo "  make superuser USERNAME=admin PASSWORD=pass  Alternative syntax"
	@echo ""
	@echo "Development:"
	@echo "  make build                                   Build the application"
	@echo "  make run                                     Run the application"
	@echo "  make migrate                                 Apply database migrations"
	@echo "  make restore                                 Restore NuGet packages"
	@echo "  make clean                                   Clean build artifacts"
	@echo "  make test                                    Run tests"
	@echo ""
	@echo "Docker:"
	@echo "  make docker-build                            Build Docker images"
	@echo "  make docker-up                               Start with Docker Compose"
	@echo "  make docker-down                             Stop Docker services"
	@echo "  make docker-dev                              Build and start development environment (with progress)"
	@echo "  make docker-dev-detached                     Build and start in background (detached mode)"
	@echo "  make docker-dev-hot                          Start development with hot reload (no rebuild)"
	@echo "  make docker-dev-rebuild                      Rebuild development environment"
	@echo ""
	@echo "Podman:"
	@echo "  make podman-build                            Build Podman images"
	@echo "  make podman-up                               Start with Podman Compose"
	@echo "  make podman-down                             Stop Podman services"
	@echo "  make podman-dev                              Build and start development environment with Podman"
	@echo "  make podman-dev-verbose                      Build and start with full progress output (foreground)"
	@echo "  make podman-dev-hot                          Start development with hot reload (no rebuild) - Podman"
	@echo "  make podman-dev-rebuild                      Rebuild development environment - Podman"
	@echo ""
	@echo "Examples:"
	@echo "  make superuser USERNAME=admin PASSWORD=secretpassword"
	@echo "  make superuser -u admin -p secretpassword"
	@echo "  make podman-dev                              # Quick start with Podman"
	@echo "  make docker-dev                              # Quick start with Docker"

# Parameters can be passed as USERNAME=value PASSWORD=value
# No complex parsing needed - Make handles this automatically

# Cross-platform detection and configuration
ifeq ($(OS),Windows_NT)
DETECTED_OS := Windows
DOTNET := dotnet
RM := del /Q /F
RMDIR := rmdir /S /Q
MKDIR := if not exist
NULL := NUL
PATH_SEP := \\
SHELL_CMD := cmd /c
# Windows command validation
CHECK_VARS = @if "$(USERNAME)" == "" (echo Error: USERNAME is required && exit /b 1) else if "$(PASSWORD)" == "" (echo Error: PASSWORD is required && exit /b 1)
# Docker compose command for Windows
DOCKER_COMPOSE := docker compose
PODMAN_COMPOSE := podman-compose
# Process management
KILL_PROC := taskkill /F /IM
BACKGROUND := start /B
else
UNAME_S := $(shell uname -s)
ifeq ($(UNAME_S),Linux)
DETECTED_OS := Linux
endif
ifeq ($(UNAME_S),Darwin)
DETECTED_OS := macOS
endif
DOTNET := dotnet
RM := rm -f
RMDIR := rm -rf
MKDIR := mkdir -p
NULL := /dev/null
PATH_SEP := /
SHELL_CMD := sh -c
# Unix command validation
CHECK_VARS = @if [ -z "$(USERNAME)" ] || [ -z "$(PASSWORD)" ]; then echo "Error: USERNAME and PASSWORD are required"; exit 1; fi
# Docker compose command for Unix systems
DOCKER_COMPOSE := docker compose
PODMAN_COMPOSE := podman-compose
# Process management
KILL_PROC := pkill -f
BACKGROUND := &
endif

# Project paths
BACKEND_DIR := backend/GarmentsERP.API
FRONTEND_DIR := frontend
SCRIPTS_DIR := scripts

# Ensure scripts directory exists
$(SCRIPTS_DIR):
ifeq ($(OS),Windows_NT)
	@if not exist $(SCRIPTS_DIR) mkdir $(SCRIPTS_DIR)
else
	@$(MKDIR) $(SCRIPTS_DIR)
endif

# Create super admin user via API endpoint
superuser: $(SCRIPTS_DIR)
	$(CHECK_VARS)
	@echo "Creating super admin user: $(USERNAME)"
	@echo "Checking if application is running..."
ifeq ($(OS),Windows_NT)
	@powershell -Command "try { $$response = Invoke-RestMethod -Uri 'http://localhost:8080/api/AdminSetup/create-admin' -Method POST -ContentType 'application/json' -Body (ConvertTo-Json @{Username='$(USERNAME)'; Password='$(PASSWORD)'}) -ErrorAction Stop; Write-Host '✅ Success: Admin user created successfully'; Write-Host 'Username:' $$response.username; Write-Host 'Email:' $$response.email; Write-Host 'User ID:' $$response.userId } catch { if ($$_.Exception.Response) { $$result = $$_.Exception.Response.GetResponseStream(); $$reader = New-Object System.IO.StreamReader($$result); $$responseBody = $$reader.ReadToEnd(); Write-Host '❌ Error:' $$_.Exception.Response.StatusCode $$_.Exception.Response.StatusDescription; Write-Host 'Details:' $$responseBody } else { Write-Host '❌ Error: Could not connect to the application. Make sure it is running on http://localhost:8080' } }"
else
	@curl -s -X POST "http://localhost:8080/api/AdminSetup/create-admin" \
		-H "Content-Type: application/json" \
		-d '{"Username":"$(USERNAME)","Password":"$(PASSWORD)"}' \
		-w "\nHTTP Status: %{http_code}\n" \
		|| echo "❌ Error: Failed to create admin user. Ensure the application is running on http://localhost:8080"
endif

# Build the entire application
build:
	@echo "Building GarmentsERP..."
	@echo "Building backend..."
	@cd $(BACKEND_DIR) && $(DOTNET) build || (echo "❌ Backend build failed" && exit 1)
	@echo "Building frontend..."
	@cd $(FRONTEND_DIR) && npm run build || (echo "❌ Frontend build failed" && exit 1)
	@echo "✅ Build completed successfully"

# Restore NuGet packages
restore:
	@echo "Restoring packages..."
	@cd $(BACKEND_DIR) && $(DOTNET) restore || (echo "❌ Backend restore failed" && exit 1)
	@cd $(FRONTEND_DIR) && npm install || (echo "❌ Frontend restore failed" && exit 1)
	@echo "✅ Package restore completed successfully"

# Run the application
run:
	@echo "Starting GarmentsERP on $(DETECTED_OS)..."
	@echo "Backend will run on: https://localhost:7001"
	@echo "Frontend will run on: http://localhost:3000"
ifeq ($(OS),Windows_NT)
	@cd $(BACKEND_DIR) && $(BACKGROUND) $(DOTNET) run
	@cd $(FRONTEND_DIR) && npm run dev
else
	@cd $(BACKEND_DIR) && $(DOTNET) run $(BACKGROUND)
	@cd $(FRONTEND_DIR) && npm run dev
endif

# Apply database migrations
migrate:
	@echo "Applying database migrations..."
	@cd $(BACKEND_DIR) && $(DOTNET) ef database update || (echo "❌ Migration failed" && exit 1)
	@echo "✅ Database migrations completed successfully"

# Run tests
test:
	@echo "Running tests..."
	@cd $(BACKEND_DIR) && $(DOTNET) test || (echo "❌ Tests failed" && exit 1)
	@echo "✅ All tests passed successfully"

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@cd $(BACKEND_DIR) && $(DOTNET) clean
ifeq ($(OS),Windows_NT)
	@cd $(FRONTEND_DIR) && if exist .next rmdir /S /Q .next && if exist node_modules rmdir /S /Q node_modules
else
	@cd $(FRONTEND_DIR) && $(RMDIR) .next node_modules
endif

# Docker commands
docker-build:
	@echo "Building Docker images on $(DETECTED_OS)..."
	@$(DOCKER_COMPOSE) build

docker-up:
	@echo "Starting with Docker Compose on $(DETECTED_OS)..."
	@$(DOCKER_COMPOSE) up -d

docker-down:
	@echo "Stopping Docker services on $(DETECTED_OS)..."
	@$(DOCKER_COMPOSE) down

docker-dev:
	@echo "Building and starting development environment on $(DETECTED_OS)..."
	@echo "📦 Building images and starting services (you'll see full progress)..."
	@echo "Disabling buildkit to avoid Podman conflicts..."
ifeq ($(OS),Windows_NT)
	@set "DOCKER_BUILDKIT=0" && docker compose -f docker-compose.dev.yml up --build
else
	@DOCKER_BUILDKIT=0 $(DOCKER_COMPOSE) -f docker-compose.dev.yml up --build
endif

# Quick background startup (detached mode)
docker-dev-detached:
	@echo "Building and starting development environment in background on $(DETECTED_OS)..."
	@echo "Disabling buildkit to avoid Podman conflicts..."
ifeq ($(OS),Windows_NT)
	@set "DOCKER_BUILDKIT=0" && docker compose -f docker-compose.dev.yml up --build -d
else
	@DOCKER_BUILDKIT=0 $(DOCKER_COMPOSE) -f docker-compose.dev.yml up --build -d
endif

# Hot reload development (no rebuild)
docker-dev-hot:
	@echo "Starting development environment with hot reload on $(DETECTED_OS)..."
ifeq ($(OS),Windows_NT)
	@docker compose -f docker-compose.dev.yml up -d
else
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml up -d
endif

# Rebuild development environment
docker-dev-rebuild:
	@echo "Rebuilding development environment on $(DETECTED_OS)..."
	@echo "Disabling buildkit to avoid Podman conflicts..."
ifeq ($(OS),Windows_NT)
	@docker compose -f docker-compose.dev.yml down
	@set "DOCKER_BUILDKIT=0" && docker compose -f docker-compose.dev.yml up --build -d
else
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml down
	@DOCKER_BUILDKIT=0 $(DOCKER_COMPOSE) -f docker-compose.dev.yml up --build -d
endif

# Backend build optimization commands
backend-build-dev:
	@echo "Building optimized backend development image on $(DETECTED_OS)..."
ifeq ($(OS),Windows_NT)
	@cd backend && powershell -ExecutionPolicy Bypass -File build-dev.ps1
else
	@cd backend && chmod +x build-dev.sh && ./build-dev.sh
endif

# Backend build validation
backend-validate:
	@echo "Validating backend Docker optimization on $(DETECTED_OS)..."
ifeq ($(OS),Windows_NT)
	@cd backend && powershell -ExecutionPolicy Bypass -File validate-optimization.ps1
else
	@echo "Validation script currently only available for Windows. Running basic validation..."
	@cd backend && docker images | grep garments-backend || echo "No backend images found"
endif

# Development status check
dev-status:
	@echo "Checking development environment status on $(DETECTED_OS)..."
ifeq ($(OS),Windows_NT)
	@powershell -Command "Write-Host '🔍 Docker Services Status:' -ForegroundColor Green; docker ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | Select-String 'garments'; Write-Host '📊 Docker Images:' -ForegroundColor Blue; docker images | Select-String 'garments'"
else
	@echo "🔍 Docker Services Status:"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep garments || echo "No garments services running"
	@echo "📊 Docker Images:"
	@docker images | grep garments || echo "No garments images found"
endif

# Development logs
dev-logs:
	@echo "Showing development environment logs on $(DETECTED_OS)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml logs -f --tail=50

# Clean development environment
dev-clean:
	@echo "Cleaning development environment on $(DETECTED_OS)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml down -v
	@docker system prune -f
	@echo "Cleaning up buildkit containers..."
	@docker container prune -f
	@docker builder prune -f
ifeq ($(OS),Windows_NT)
	@powershell -Command "docker images | Select-String 'garments' | ForEach-Object { $$_.ToString().Split()[0] + ':' + $$_.ToString().Split()[1] } | ForEach-Object { docker rmi $$_ -f }"
else
	@docker images | grep garments | awk '{print $$1":"$$2}' | xargs -r docker rmi -f
endif

# Reset development environment (clean restart)
dev-reset:
	@echo "Resetting development environment on $(DETECTED_OS)..."
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml down
	@$(DOCKER_COMPOSE) -f docker-compose.dev.yml up --build -d
	@echo "✅ Development environment reset complete!"

# Podman commands (alternative to Docker)
podman-build:
	@echo "Building Podman images on $(DETECTED_OS)..."
	@$(PODMAN_COMPOSE) build --no-cache

podman-up:
	@echo "Starting with Podman Compose on $(DETECTED_OS)..."
	@$(PODMAN_COMPOSE) up -d

podman-down:
	@echo "Stopping Podman services on $(DETECTED_OS)..."
	@$(PODMAN_COMPOSE) down

podman-dev:
	@echo "Building and starting development environment with Podman on $(DETECTED_OS)..."
	@echo "📦 Building images and starting services (this may take a few minutes)..."
	podman-compose -f docker-compose.podman.yml up --build -d

# Build and start with full progress output (foreground)
podman-dev-verbose:
	@echo "Building and starting development environment with Podman (VERBOSE) on $(DETECTED_OS)..."
	@echo "📦 You'll see full build progress and logs..."
	podman-compose -f docker-compose.podman.yml up --build

# Hot reload development with Podman (no rebuild)
podman-dev-hot:
	@echo "Starting development environment with hot reload using Podman on $(DETECTED_OS)..."
	@$(PODMAN_COMPOSE) -f docker-compose.podman.yml up -d

# Rebuild development environment with Podman
podman-dev-rebuild:
	@echo "Rebuilding development environment with Podman on $(DETECTED_OS)..."
	@$(PODMAN_COMPOSE) -f docker-compose.podman.yml down
	@$(PODMAN_COMPOSE) -f docker-compose.podman.yml up --build -d --no-cache

# Podman development status check
podman-dev-status:
	@echo "Checking Podman development environment status on $(DETECTED_OS)..."
ifeq ($(OS),Windows_NT)
	@powershell -Command "Write-Host '🔍 Podman Services Status:' -ForegroundColor Green; podman ps --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}' | Select-String 'garments'; Write-Host '📊 Podman Images:' -ForegroundColor Blue; podman images | Select-String 'garments'"
else
	@echo "🔍 Podman Services Status:"
	@podman ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep garments || echo "No garments services running"
	@echo "📊 Podman Images:"
	@podman images | grep garments || echo "No garments images found"
endif

# Podman development logs
podman-dev-logs:
	@echo "Showing Podman development environment logs on $(DETECTED_OS)..."
	@$(PODMAN_COMPOSE) -f docker-compose.podman.yml logs -f --tail=50

# Clean Podman development environment
podman-dev-clean:
	@echo "Cleaning Podman development environment on $(DETECTED_OS)..."
	@$(PODMAN_COMPOSE) -f docker-compose.podman.yml down -v
	@podman system prune -f
ifeq ($(OS),Windows_NT)
	@powershell -Command "podman images | Select-String 'garments' | ForEach-Object { $$_.ToString().Split()[0] + ':' + $$_.ToString().Split()[1] } | ForEach-Object { podman rmi $$_ -f }"
else
	@podman images | grep garments | awk '{print $$1":"$$2}' | xargs -r podman rmi -f
endif

# Reset Podman development environment (clean restart)
podman-dev-reset:
	@echo "Resetting Podman development environment on $(DETECTED_OS)..."
	@$(PODMAN_COMPOSE) -f docker-compose.podman.yml down
	@$(PODMAN_COMPOSE) -f docker-compose.podman.yml up --build -d --no-cache
	@echo "✅ Podman development environment reset complete!"

# Prevent make from trying to create files for these targets
%:
	@:

# Help for specific commands
superuser-help:
	@echo "Create Super Admin User"
	@echo "======================="
	@echo ""
	@echo "This command creates a super admin user for first-time setup."
	@echo "The user will have full administrative privileges."
	@echo ""
	@echo "Usage:"
	@echo "  make superuser USERNAME=<username> PASSWORD=<password>"
	@echo "  make superuser -u <username> -p <password>"
	@echo ""
	@echo "Examples:"
	@echo "  make superuser USERNAME=admin PASSWORD=secretpassword"
	@echo "  make superuser -u admin -p mypassword123"
	@echo ""
	@echo "Requirements:"
	@echo "  - .NET SDK installed"
	@echo "  - Database connection configured"
	@echo "  - Backend project built"
	@echo ""
	@echo "Security Notes:"
	@echo "  - Use a strong password (minimum 8 characters)"
	@echo "  - This command should only be used for initial setup"
	@echo "  - Only one super admin can be created this way"
