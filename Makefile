# New-tree Makefile. The legacy one lives at legacy/Makefile and is frozen.
# Every target that reports success must be backed by verify-all.sh, not by optimism.

.DEFAULT_GOAL := help
SHELL := /bin/bash

# --env-file is required: compose resolves .env relative to the compose file's own directory
# (infra/), not the repository root, so without it ${POSTGRES_PASSWORD} never interpolates.
COMPOSE_DEV := docker compose --env-file .env -f infra/compose.dev.yml
DOTNET := dotnet

.PHONY: help verify verify-quick build restore run test up down dev-reset migrate db-shell

help:
	@echo "Garments ERP — new tree"
	@echo ""
	@echo "  make verify        the gate: build + laws + tests + frontend + empty-db migrations"
	@echo "  make verify-quick  same, skipping container-backed stages"
	@echo "  make build         build the solution (warnings are errors)"
	@echo "  make test          run all test projects"
	@echo "  make up            start dev Postgres + Redis"
	@echo "  make down          stop dev services"
	@echo "  make dev-reset     destroy the dev database volume (asks first)"
	@echo "  make migrate       apply EF migrations to the dev database"
	@echo "  make db-shell      psql into the dev database"

verify:
	@./verify-all.sh

verify-quick:
	@./verify-all.sh --quick

build:
	@$(DOTNET) build GarmentsERP.slnx -v q --nologo

restore:
	@$(DOTNET) restore GarmentsERP.slnx

run:
	@$(DOTNET) run --project src/Api

test:
	@$(DOTNET) test GarmentsERP.slnx -v q --nologo

up:
	@$(COMPOSE_DEV) up -d

down:
	@$(COMPOSE_DEV) down

# Destructive and deliberately gated: a password that was once public means the old volume may
# hold data keyed to credentials we burned during the 2026-10-15 history scrub.
dev-reset:
	@echo "This deletes the dev Postgres volume. Type YES to confirm:"; \
	read answer; \
	[ "$$answer" = "YES" ] && $(COMPOSE_DEV) down -v && echo "volume removed" || echo "aborted"

migrate:
	@$(DOTNET) ef database update --project src/Api --startup-project src/Api

db-shell:
	@$(COMPOSE_DEV) exec postgres psql -U postgres -d garments
