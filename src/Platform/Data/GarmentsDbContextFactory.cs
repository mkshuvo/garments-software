using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Garments.Platform.Data;

/// <summary>
/// Lets the EF tooling build the context without going through the application's composition root.
/// </summary>
/// <remarks>
/// Migrations are DDL against the whole schema, not rows inside one tenant, so they cannot carry a
/// tenant — and <see cref="Tenancy.TenantSessionInterceptor"/> rightly refuses to open a connection
/// that does. Without this factory, <c>dotnet ef database update</c> fails on the tenancy guard and
/// the tempting wrong fix is to relax the guard. The runtime path keeps the interceptor; only the
/// design-time path skips it, and it is reached solely by the EF tools.
///
/// It reads the same environment variable the host does, and deliberately has no fallback: a
/// migration applied against a database nobody intended is worse than a migration that refuses to
/// run.
/// </remarks>
public sealed class GarmentsDbContextFactory : IDesignTimeDbContextFactory<GarmentsDbContext>
{
    public const string ConnectionStringEnvironmentVariable = "ConnectionStrings__Default";

    public GarmentsDbContext CreateDbContext(string[] args)
    {
        var connectionString = Environment.GetEnvironmentVariable(ConnectionStringEnvironmentVariable)
            ?? throw new InvalidOperationException(
                $"{ConnectionStringEnvironmentVariable} must be set to run migrations. It is the connection "
                + "of the owning principal, not the runtime one, and guessing it is not a fallback.");

        var options = new DbContextOptionsBuilder<GarmentsDbContext>()
            .UseNpgsql(connectionString)
            .Options;

        // An unscoped context, not a bypassed one: it resolves to TenantId.None, which matches no row.
        // Migrations issue DDL and never read tenant data, so there is nothing for it to leak.
        return new GarmentsDbContext(options, new Tenancy.AmbientTenantContext());
    }
}
