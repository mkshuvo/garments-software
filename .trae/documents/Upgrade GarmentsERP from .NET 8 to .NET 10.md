## Goals
- Upgrade backend from `net8.0` to `net10.0` with zero regressions
- Address .NET 10 and EF Core 10 compatibility changes
- Update Docker, CI/CD, and version pinning for predictable builds

## Scope
- Project: `backend/GarmentsERP.API/GarmentsERP.API.csproj` (currently `net8.0`)
- Dependencies: ASP.NET Core, EF Core, Npgsql provider, Redis, OpenAPI/Swagger, test SDKs
- Runtime: Windows dev; container images updated to .NET 10 (default images use Ubuntu)

## Prerequisites
- Install `.NET 10 SDK`
- Ensure developers/CI agents have Docker CE and updated images pulled
- Confirm no uncommitted changes before upgrade

## Step 1 — SDK Pinning and Build Guardrails
- Add `global.json` to pin SDK: `{ "sdk": { "version": "10.0.100", "rollForward": "latestFeature" } }`
- Add `<AnalysisLevel>9.0</AnalysisLevel>` initially to avoid new analyzer rule churn, then move to `10.0` after cleanup
- Enable deterministic package versions:
  - `<RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>` in `.csproj`
  - Consider `Directory.Packages.props` for central package management

## Step 2 — TargetFramework Upgrade
- Update all projects to `net10.0`:
  - Change `<TargetFramework>net8.0</TargetFramework>` → `net10.0` in `GarmentsERP.API.csproj`
- Run `dotnet build` to surface compile-time issues

## Step 3 — Package Upgrades
- Bump Microsoft packages to 10.x compatible latest stable:
  - `Microsoft.AspNetCore.Authentication.JwtBearer`
  - `Microsoft.AspNetCore.Identity.EntityFrameworkCore`
  - `Microsoft.EntityFrameworkCore.*` (Design, InMemory)
  - `Microsoft.Extensions.Caching.StackExchangeRedis`
  - `Microsoft.AspNetCore.OpenApi` (handle deprecations)
  - `Microsoft.AspNetCore.Mvc.Testing`, `Microsoft.NET.Test.Sdk`
- Upgrade third-party packages to latest stable compatible with EF Core 10:
  - `Npgsql.EntityFrameworkCore.PostgreSQL`
  - `Swashbuckle.AspNetCore`
  - `xunit`, `xunit.runner.visualstudio`, `Moq`

## Step 4 — Compatibility Remediation (ASP.NET Core)
- Replace deprecated/obsolete items referenced in .NET 10 breaking changes:
  - `WithOpenApi` extensions: migrate to supported approach (use `MapOpenApi()` / `AddEndpointsApiExplorer` where applicable)
  - `IActionContextAccessor`/`ActionContextAccessor` obsolete: replace with recommended APIs (e.g., `LinkGenerator`, scoped access patterns)
  - Cookie login redirects disabled for known API endpoints: validate if cookie auth is used; adjust auth flows (we use JWT, so minimal impact)
  - `ForwardedHeadersOptions.KnownNetworks` / `IPNetwork` obsolete: update forwarding settings
  - Razor runtime compilation obsolete: ensure not in use (API project typically unaffected)
- Validate HTTP behavior changes:
  - Streaming HTTP responses enabled by default in browser HTTP clients
  - URI length limits removed; confirm any assumptions

## Step 5 — Compatibility Remediation (Runtime & Crypto)
- Env variable renames:
  - `DOTNET_OPENSSL_VERSION_OVERRIDE` (rename from prior)
  - `DOTNET_ICU_VERSION_OVERRIDE` (for globalization ICU)
- If OpenSSL/ICU overrides are used, update environment and documentation

## Step 6 — EF Core 10
- Review EF Core breaking changes:
  - `BackgroundService` runs all of `ExecuteAsync` as a Task: audit any hosted services and lifetimes
  - Configuration null handling preserved: check config binding assumptions
- Update EF Core packages and Npgsql provider; run migrations build/test

## Step 7 — Docker & Containerization
- Update Dockerfiles to .NET 10 images:
  - Base: `mcr.microsoft.com/dotnet/aspnet:10.0`
  - Build: `mcr.microsoft.com/dotnet/sdk:10.0`
- Confirm default images use Ubuntu; review any Windows-only assumptions
- Validate publish settings:
  - If using `PublishTrimmed`, note HTTP/3 support disabled by default; configure explicitly if needed
- Rebuild images and run containers locally for smoke tests

## Step 8 — CI/CD Updates
- Update build agents to .NET 10 SDK; honor `global.json`
- Update pipelines to run:
  - `dotnet restore` (with lock file)
  - `dotnet build -c Release`
  - `dotnet test --collect:"XPlat Code Coverage"`
  - Docker build and push using .NET 10 base images
- Pin analyzer level step-wise: move from `9.0` → `10.0` after remediation

## Step 9 — Testing & Validation
- Run unit/integration tests; fix failures
- Add targeted tests for areas impacted by breaking changes:
  - Auth middleware behavior
  - OpenAPI generation changes
  - Reverse proxy/forwarded headers
  - Hosted service lifecycles
- Perform manual API smoke tests (auth endpoints, common routes)
- Performance baseline before/after; validate no regressions

## Step 10 — Rollback & Risk Mitigation
- Keep a branch with `net8.0` and 8.x packages
- Use feature flags for any behavior toggles (HTTP/3, streaming)
- If blockers occur, pin SDK to `9.0.x` via `global.json` temporarily and stage upgrade by subsystem

## Deliverables
- Updated project files targeting `net10.0`
- Upgraded NuGet dependencies and Dockerfiles
- CI pipeline running against .NET 10
- Test report and compatibility notes

## Approval Request
- Confirm to proceed with executing this plan. Upon approval, we’ll apply changes, run builds/tests, and provide a detailed upgrade report with diffs and validation results.