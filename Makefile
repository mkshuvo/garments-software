# GarmentsERP Makefile
# Professional admin creation and development utilities

.PHONY: help superuser build run clean test migrate restore docker-build docker-up docker-down docker-dev

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
	@echo "  make docker-dev                              Build and start development environment"
	@echo ""
	@echo "Examples:"
	@echo "  make superuser USERNAME=admin PASSWORD=secretpassword"
	@echo "  make superuser -u admin -p secretpassword"

# Extract parameters from command line arguments
USERNAME := $(filter-out $@,$(MAKECMDGOALS))
PASSWORD := $(filter-out $@,$(MAKECMDGOALS))

# Parse -u and -p flags
ifneq ($(filter -u,$(MAKECMDGOALS)),)
	USERNAME_INDEX := $(shell echo $(MAKECMDGOALS) | tr ' ' '\n' | grep -n "\-u" | cut -d: -f1)
	USERNAME := $(word $(shell expr $(USERNAME_INDEX) + 1),$(MAKECMDGOALS))
endif

ifneq ($(filter -p,$(MAKECMDGOALS)),)
	PASSWORD_INDEX := $(shell echo $(MAKECMDGOALS) | tr ' ' '\n' | grep -n "\-p" | cut -d: -f1)
	PASSWORD := $(word $(shell expr $(PASSWORD_INDEX) + 1),$(MAKECMDGOALS))
endif

# Cross-platform detection
ifeq ($(OS),Windows_NT)
	DETECTED_OS := Windows
	DOTNET := dotnet.exe
	RM := del /Q /F
	RMDIR := rmdir /S /Q
	MKDIR := mkdir
	NULL := NUL
	# Use a different check for Windows as [ -z ... ] is not available
	CHECK_VARS = if "$(USERNAME)" == "" (exit 1) else if "$(PASSWORD)" == "" (exit 1)
else
	DETECTED_OS := $(shell uname -s)
	DOTNET := dotnet
	RM := rm -f
	RMDIR := rm -rf
	MKDIR := mkdir -p
	NULL := /dev/null
	CHECK_VARS = if [ -z "$(USERNAME)" ] || [ -z "$(PASSWORD)" ]; then exit 1; fi
endif

# Project paths
BACKEND_DIR := backend/GarmentsERP.API
FRONTEND_DIR := frontend
SCRIPTS_DIR := scripts

# Ensure scripts directory exists
$(SCRIPTS_DIR):
	$(MKDIR) $(SCRIPTS_DIR)

# Create super admin user via API endpoint
superuser: $(SCRIPTS_DIR)
	$(CHECK_VARS)
	@echo "Creating super admin user: $(USERNAME)"
	@echo "Checking if application is running..."
ifeq ($(OS),Windows_NT)
	@powershell -Command "$$response = try { Invoke-RestMethod -Uri 'http://localhost:8080/api/AdminSetup/create-admin' -Method POST -ContentType 'application/json' -Body (ConvertTo-Json @{Username='$(USERNAME)'; Password='$(PASSWORD)'}) -ErrorAction Stop } catch { $$_.Exception.Response }; if ($$response.GetType().Name -eq 'HttpWebResponse') { Write-Host 'Error:' $$response.StatusCode $$response.StatusDescription } else { Write-Host 'Success: Admin user created' }"
else
	@curl -s -X POST "http://localhost:8080/api/AdminSetup/create-admin" \
		-H "Content-Type: application/json" \
		-d '{"Username":"$(USERNAME)","Password":"$(PASSWORD)"}' \
		|| echo "Error: Failed to create admin user. Ensure the application is running on http://localhost:8080"
endif

# Build the entire application
build:
	@echo "Building GarmentsERP..."
	@echo "Building backend..."
	@cd $(BACKEND_DIR) && $(DOTNET) build
	@echo "Building frontend..."
	@cd $(FRONTEND_DIR) && npm run build

# Restore NuGet packages
restore:
	@echo "Restoring packages..."
	@cd $(BACKEND_DIR) && $(DOTNET) restore
	@cd $(FRONTEND_DIR) && npm install

# Run the application
run:
	@echo "Starting GarmentsERP..."
	@echo "Backend will run on: https://localhost:7001"
	@echo "Frontend will run on: http://localhost:3000"
	@cd $(BACKEND_DIR) && $(DOTNET) run &
	@cd $(FRONTEND_DIR) && npm run dev

# Apply database migrations
migrate:
	@echo "Applying database migrations..."
	@cd $(BACKEND_DIR) && $(DOTNET) ef database update

# Run tests
test:
	@echo "Running tests..."
	@cd $(BACKEND_DIR) && $(DOTNET) test

# Clean build artifacts
clean:
	@echo "Cleaning build artifacts..."
	@cd $(BACKEND_DIR) && $(DOTNET) clean
	@cd $(FRONTEND_DIR) && $(RM) -rf .next node_modules

# Docker commands
docker-build:
	@echo "Building Docker images..."
	@docker-compose build

docker-up:
	@echo "Starting with Docker Compose..."
	@docker-compose up -d

docker-down:
	@echo "Stopping Docker services..."
	@docker-compose down

docker-dev:
	@echo "Building and starting development environment..."
	@docker compose -f docker-compose.dev.yml up --build -d

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
