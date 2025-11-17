## Objectives
- Build and run all containers with the .NET 10-upgraded backend
- Continuously inspect container health/logs and fix issues until the stack is stable

## Preparation
- Validate compose files: `docker-compose.yml`, `docker-compose.dev.yml`
- Verify required files exist: `backend/Dockerfile`, `frontend/Dockerfile`, `nginx.conf`
- Note .NET 10 default images use Ubuntu; align health checks and SSL/ICU environment when necessary

## Build & Up
1. Clean local images for backend/frontend if needed to avoid stale layer conflicts
2. Run `docker compose -f docker-compose.yml up --build -d`
3. Verify ports:
   - Backend `8080`, Frontend `3000`, Nginx `80/443`, Redis Commander `8081`, pgAdmin `5050`, Postgres `5432`

## Health & Logs
- Check service status: `docker compose ps`
- Stream logs per service (backend, frontend, postgres, redis, nginx, pgadmin, redis-commander): `docker compose logs -f <service>`
- Confirm healthchecks:
  - Backend: `/api/health` (compose) and `/health` (Dockerfile) — unify to `/api/health`
  - Frontend: root `GET /`
  - Nginx: `nginx -t`
  - Postgres: `pg_isready`
  - Redis: `redis-cli ping`

## Likely Fixes to Apply Iteratively
- Backend healthcheck mismatch
  - Ensure container has `curl`; if using the API-specific Dockerfile, add `apt-get install -y curl` in final stage
  - Standardize both Dockerfile and compose to `/api/health`
- Redis image tag validity
  - If `redis:8.0.3-alpine3.21` fails to pull, switch to stable `redis:7.4-alpine` (or latest supported)
- Database connectivity/migration
  - Validate `ConnectionStrings__DefaultConnection` to `postgres` host resolves
  - If migrations fail, run `dotnet ef database update` inside the container or review startup migration logs
- pgAdmin initial setup
  - Ensure `PGADMIN_DEFAULT_PASSWORD` provided via env/`.env`; validate startup logs for auth issues
- Nginx routing
  - Confirm upstream names `backend` and `frontend` resolve within `garments-network`
  - Verify proxy paths `/api/*` reach backend and `/` reaches frontend
- OpenSSL/ICU settings (Linux containers)
  - If crypto/globalization errors appear, set env overrides: `DOTNET_OPENSSL_VERSION_OVERRIDE`, `DOTNET_ICU_VERSION_OVERRIDE`

## Validation
- Backend: `GET http://localhost:8080/api/health` returns healthy JSON
- Frontend: `GET http://localhost:3000/` serves app
- Nginx: `GET http://localhost/` proxies to frontend; `GET http://localhost/api/health` proxies to backend
- Postgres: `pg_isready` healthy; database tables present after migrations
- Redis: ping ok; simple set/get works; Redis Commander UI accessible at `http://localhost:8081/`
- pgAdmin: accessible at `http://localhost:5050/` and can connect to `postgres`

## Deliverables
- Running stack with all containers healthy
- List of changes applied (Dockerfiles/compose updates) and rationale
- Commands run and tail logs proving stability

## Request
- Approve this plan to proceed. I will run the stack, analyze logs, implement fixes iteratively (image tags, healthchecks, envs), and report back with a stable deployment and verification results.