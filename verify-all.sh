#!/usr/bin/env bash
# verify-all.sh — the one command that decides whether a phase is done.
#
# Existence reason: the legacy tree shipped a frontend that could not build and a backend whose
# accounting services were commented out, while docs claimed completion. Nothing checked. Prose
# status is not evidence; this script is. A phase is complete when this prints PASS.
#
# Usage:  ./verify-all.sh            full gate
#         ./verify-all.sh --quick    skip container-backed integration stages
set -uo pipefail
cd "$(dirname "$0")"

QUICK=0
[[ "${1:-}" == "--quick" ]] && QUICK=1

SOLUTION="GarmentsERP.slnx"
FAILED=()
PASSED=()

step() {
  local name="$1"; shift
  local log; log="$(mktemp)"
  printf '\n\033[1m▶ %s\033[0m\n' "$name"
  if "$@" > "$log" 2>&1; then
    PASSED+=("$name")
    printf '  \033[32mPASS\033[0m %s\n' "$name"
  else
    FAILED+=("$name")
    printf '  \033[31mFAIL\033[0m %s\n' "$name"
    tail -n 40 "$log" | sed 's/^/      /'
  fi
  rm -f "$log"
}

# ---------------------------------------------------------------- backend
step "backend: restore" dotnet restore "$SOLUTION"
step "backend: build (warnings are errors)" dotnet build "$SOLUTION" --no-restore -v q --nologo

# Engineering law L1/L1b/L2/L3/L6/L8. These fail the build, not a reviewer.
step "architecture: engineering laws" dotnet test tests/Garments.Tests.Architecture --no-build -v q --nologo
step "unit: domain primitives" dotnet test tests/Garments.Tests.Unit --no-build -v q --nologo
step "integration: composition root activates every controller" dotnet test tests/Garments.Tests.Integration --no-build -v q --nologo

# ---------------------------------------------------------------- boot
# Building is not starting. The legacy tree proved nothing about boot: its accounting controllers
# threw at activation because 22 registrations sat commented out, and the one thing that would have
# caught it cheaply — "does the process come up and answer" — was never run.
#
# The app refuses to start without a configured database, so the gate provides one instead of
# weakening the app. Credentials stay in the untracked .env and reach the process as environment
# variables, which is the only path .NET config uses for them; no dev password is committed.
if [[ "$QUICK" -eq 0 ]] || [[ -f .env ]]; then
  docker compose --env-file .env -f infra/compose.dev.yml up -d >/dev/null 2>&1 || true
fi

# Kestrel is told to bind port 0 and the gate reads back whatever it actually got. This machine
# reserves whole 100-port blocks to Hyper-V whenever Docker Desktop restarts (currently 7122-7221,
# previously 5432-5435 and 5199), so any hardcoded dev port eventually fails for a reason that has
# nothing to do with the code — and a gate that fails for environmental reasons gets ignored.
step "app boots and answers /health" bash -c '
  set -e
  LOG=/tmp/garments-boot.log
  : > "$LOG"

  POSTGRES_PASSWORD=$(grep -E "^POSTGRES_PASSWORD=" .env | cut -d= -f2-)
  export ConnectionStrings__Default="Host=127.0.0.1;Port=6432;Database=garments;Username=postgres;Password=$POSTGRES_PASSWORD"
  export ASPNETCORE_ENVIRONMENT=Development

  dotnet run --project src/Api --no-build --no-launch-profile \
    --urls "http://127.0.0.1:0" > "$LOG" 2>&1 &
  PID=$!

  cleanup() {
    # dotnet run spawns the real host as a child; killing only the parent leaks the child and
    # squats a port for every later run.
    kill "$PID" 2>/dev/null || true
    pkill -f "Garments.Api" 2>/dev/null || true
    wait "$PID" 2>/dev/null || true
  }
  trap cleanup EXIT

  PORT=""
  for _ in $(seq 1 40); do
    PORT=$(grep -oE "Now listening on: http://[0-9.]+:[0-9]+" "$LOG" | grep -oE "[0-9]+$" | head -1)
    [ -n "$PORT" ] && break
    kill -0 "$PID" 2>/dev/null || break
    sleep 1
  done

  if [ -z "$PORT" ]; then
    echo "never reported a bound address:"; tail -n 25 "$LOG"; exit 1
  fi

  if ! curl -fsS "http://127.0.0.1:$PORT/health/live" >/dev/null 2>&1; then
    echo "bound port $PORT but /health/live did not answer:"; tail -n 25 "$LOG"; exit 1
  fi
  curl -fsS "http://127.0.0.1:$PORT/health/ready" > /dev/null
  echo "healthy on ephemeral port $PORT"
'

# ---------------------------------------------------------------- frontend
if [[ -d web ]]; then
  step "frontend: install" bash -c "cd web && npm ci --no-audit --no-fund || npm install --no-audit --no-fund"
  # Real exit code, no pipe: `npm run build | tail` reports tail's status and hides failures.
  step "frontend: type-check" bash -c "cd web && npm run type-check"
  step "frontend: lint (L12-L15, L17)" bash -c "cd web && npm run lint"
  step "frontend: production build" bash -c "cd web && npm run build"
  step "frontend: route graph closed (L14)" bash -c "cd web && node scripts/check-route-graph.mjs"
else
  echo "  (web/ not present yet — frontend gate skipped; required from P1 onward)"
fi

# ---------------------------------------------------------------- database
if [[ "$QUICK" -eq 0 ]]; then
  if ! docker info >/dev/null 2>&1; then
    FAILED+=("database: migrations on empty Postgres (Docker daemon not running)")
    printf '\n\033[31mFAIL\033[0m Docker daemon is down; the empty-database migration gate cannot run.\n'
  else
    # L7: migrations must apply to an EMPTY database. Half-migrated local volumes hid the legacy
    # tree's SQL-Server-typed migration for a year because everyone's database was already dirty.
    if find src -path '*/Migrations/*Designer.cs' -print -quit | grep -q .; then
      step "database: migrations apply to empty Postgres" bash -c '
        set -e
        C=garments-verify-pg-$$
        docker run -d --rm --name "$C" -e POSTGRES_PASSWORD=verify -e POSTGRES_DB=garments -p 0:5432 postgres:17-alpine >/dev/null
        trap "docker stop $C >/dev/null 2>&1 || true" EXIT
        PORT=$(docker port "$C" 5432 | tail -1 | cut -d: -f2)
        for i in $(seq 1 60); do docker exec "$C" pg_isready -U postgres >/dev/null 2>&1 && break; sleep 1; done
        dotnet ef database update --project src/Api --startup-project src/Api -v q --nologo \
          --ConnectionStrings:Default="Host=localhost;Port=$PORT;Database=garments;Username=postgres;Password=verify"
        docker exec "$C" psql -U postgres -d garments -tAc "select 1" >/dev/null
      '
    else
      printf '\n  (no EF migrations exist yet — L7 database gate activates with P2)\n'
    fi
  fi
fi

# ---------------------------------------------------------------- coverage
# A green check over an empty set is not coverage. The legacy project asserted "all accounting
# services registered" against a list nobody populated, so print the real counts every run.
printf '\n\033[1m▶ gate coverage (informational)\033[0m\n'
printf '  controllers          : %s\n' "$(grep -rlE 'class \w+Controller\b' src --include='*.cs' 2>/dev/null | wc -l | tr -d ' ')"
printf '  endpoints ([Http…])   : %s\n' "$(grep -rhoE '\[Http(Get|Post|Put|Delete|Patch)' src --include='*.cs' 2>/dev/null | wc -l | tr -d ' ')"
printf '  EF migrations        : %s\n' "$(find src -path '*/Migrations/*Designer.cs' 2>/dev/null | wc -l | tr -d ' ')"
printf '  DB check constraints : %s\n' "$(grep -rhoE "name: \"(CK|UQ|FK)_[a-z_]+\"" src --include='*.cs' 2>/dev/null | wc -l | tr -d ' ')"
printf '  source .cs files     : %s\n' "$(find src -name '*.cs' -not -path '*/obj/*' -not -path '*/bin/*' 2>/dev/null | wc -l | tr -d ' ')"
printf '  test .cs files       : %s\n' "$(find tests -name '*.cs' -not -path '*/obj/*' -not -path '*/bin/*' 2>/dev/null | wc -l | tr -d ' ')"

# ---------------------------------------------------------------- verdict
printf '\n════════════════════════════════════════\n'
if [[ ${#FAILED[@]} -eq 0 ]]; then
  printf '\033[32mPASS\033[0m — %d checks green. This phase may be called complete.\n' "${#PASSED[@]}"
  exit 0
fi

printf '\033[31mFAIL\033[0m — %d passed, %d failed:\n' "${#PASSED[@]}" "${#FAILED[@]}"
for failure in "${FAILED[@]}"; do printf '  • %s\n' "$failure"; done
printf '\nNo phase may be reported complete while this prints FAIL.\n'
exit 1
