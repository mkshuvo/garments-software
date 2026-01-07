# GarmentsERP Makefile
# Development utilities and Docker management

.PHONY: help superuser build run clean test migrate restore docker-build docker-up docker-down docker-dev docker-hot docker-rebuild dev-status dev-logs dev-clean dev-reset superuser-help

# Default target
help:
	@echo "GarmentsERP Makefile Commands:"
	@echo ""
	@echo "Admin Management:"
	@echo "  make superuser USERNAME=admin PASSWORD=pass  Create a super admin user"
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
	@echo "  make docker-dev                              Build and start development environment"
	@echo "  make docker-up                               Start containers (no rebuild)"
	@echo "  make docker-down                             Stop Docker services"
	@echo "  make docker-hot                              Start with hot reload (no rebuild)"
	@echo "  make docker-rebuild                          Rebuild development environment"
	@echo "  make dev-status                              Check container status"
	@echo "  make dev-logs                                Show container logs"
	@echo "  make dev-clean                               Clean Docker environment"
	@echo "  make dev-reset                               Reset Docker environment"
	@echo ""
	@echo "Examples:"
	@echo "  make superuser USERNAME=admin PASSWORD=secretpassword"
	@echo "  make docker-dev                              # Quick start with Docker"

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
CHECK_VARS = @if "$(USERNAME)" == "" (echo Error: USERNAME is required && exit /b 1) else if "$(PASSWORD)" == "" (echo Error: PASSWORD is required && exit /b 1)
DOCKER_COMPOSE := docker compose
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
CHECK_VARS = @if [ -z "$(USERNAME)" ] || [ -z "$(PASSWORD)" ]; then echo "Error: USERNAME and PASSWORD are required"; exit 1; fi
DOCKER_COMPOSE := docker compose
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

# Decrypt secrets from encrypted file
decrypt-secrets:
	@echo "🔐 Decrypting secrets..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File scripts/decrypt-secrets.ps1
else
	@bash scripts/decrypt-secrets.sh
endif

# Encrypt secrets (after manual editing of secrets.yaml)
encrypt-secrets:
	@echo "🔒 Encrypting secrets..."
ifeq ($(OS),Windows_NT)
	@sops -e secrets.yaml | Out-File -FilePath secrets.enc.yaml -Encoding utf8
	@del secrets.yaml
else
	@sops -e secrets.yaml > secrets.enc.yaml
	@rm secrets.yaml
endif
	@echo "✅ Secrets encrypted to secrets.enc.yaml"

# Initialize super admin user
init-superadmin:
	@echo "👤 Initializing super admin..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File scripts/init-superadmin.ps1
else
	@bash scripts/init-superadmin.sh
endif

docker-dev:
	@echo "🔐 Step 1: Decrypting secrets..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File scripts/decrypt-secrets.ps1
else
	@bash scripts/decrypt-secrets.sh
endif
	@echo "🚀 Step 2: Building and starting containers..."
ifeq ($(OS),Windows_NT)
	@set "DOCKER_BUILDKIT=0" && docker compose up --build -d
else
	@DOCKER_BUILDKIT=0 $(DOCKER_COMPOSE) up --build -d
endif
	@echo "👤 Step 3: Initializing super admin..."
ifeq ($(OS),Windows_NT)
	@powershell -ExecutionPolicy Bypass -File scripts/init-superadmin.ps1
else
	@bash scripts/init-superadmin.sh
endif
	@echo "✅ Development environment ready!"

# Hot reload development (no rebuild)
docker-hot:
	@echo "Starting development environment with hot reload on $(DETECTED_OS)..."
	@$(DOCKER_COMPOSE) up -d

# Rebuild development environment
docker-rebuild:
	@echo "Rebuilding development environment on $(DETECTED_OS)..."
ifeq ($(OS),Windows_NT)
	@docker compose down
	@set "DOCKER_BUILDKIT=0" && docker compose up --build -d
else
	@$(DOCKER_COMPOSE) down
	@DOCKER_BUILDKIT=0 $(DOCKER_COMPOSE) up --build -d
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
	@$(DOCKER_COMPOSE) logs -f --tail=50

# Clean development environment
dev-clean:
	@echo "Cleaning development environment on $(DETECTED_OS)..."
	@$(DOCKER_COMPOSE) down -v
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
	@$(DOCKER_COMPOSE) down
	@$(DOCKER_COMPOSE) up --build -d
	@echo "✅ Development environment reset complete!"

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
	@echo ""
	@echo "Examples:"
	@echo "  make superuser USERNAME=admin PASSWORD=secretpassword"
	@echo ""
	@echo "Requirements:"
	@echo "  - Docker containers running"
	@echo "  - Backend healthy and accessible"
	@echo ""
	@echo "Security Notes:"
	@echo "  - Use a strong password (minimum 8 characters)"
	@echo "  - This command should only be used for initial setup"
