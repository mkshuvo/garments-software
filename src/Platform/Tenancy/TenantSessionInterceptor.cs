using System.Data.Common;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace Garments.Platform.Tenancy;

/// <summary>
/// Writes the resolved tenant into the Postgres session as <c>app.tenant_id</c> the moment a
/// connection opens, which is what the row-level security policies read.
/// </summary>
/// <remarks>
/// This is the load-bearing piece of tenant isolation, and it fails closed: a connection opened
/// without a resolved tenant is refused outright rather than left with a null setting. A null
/// <c>app.tenant_id</c> against a policy written as <c>tenant_id = current_setting(...)</c> yields no
/// rows, which looks like an empty tenant to a user and looks like "working" to a developer — the
/// opposite of what the legacy build needed, where any authenticated manager could read every
/// company's ledger.
///
/// Paired with <c>AddDbContext</c> and never <c>AddDbContextPool</c>: a pooled context reuses
/// tracked state across requests, and the legacy tree pooled at 128 with no per-open reset.
/// </remarks>
public sealed class TenantSessionInterceptor(ITenantContext tenantContext) : DbConnectionInterceptor
{
    internal const string TenantSettingName = "app.tenant_id";

    public override void ConnectionOpened(DbConnection connection, ConnectionEndEventData eventData)
    {
        if (!tenantContext.HasTenant)
        {
            throw new InvalidOperationException(
                "Refusing to open a database connection with no tenant resolved. Background jobs and CLI paths "
                + "must establish a tenant explicitly instead of relying on request scope.");
        }

        Apply(connection, tenantContext.TenantId.ToString());
    }

    public override async Task ConnectionOpenedAsync(DbConnection connection, ConnectionEndEventData eventData, CancellationToken cancellationToken = default)
    {
        if (!tenantContext.HasTenant)
        {
            throw new InvalidOperationException(
                "Refusing to open a database connection with no tenant resolved. Background jobs and CLI paths "
                + "must establish a tenant explicitly instead of relying on request scope.");
        }

        await ApplyAsync(connection, tenantContext.TenantId.ToString(), cancellationToken).ConfigureAwait(false);
    }

    private static void Apply(DbConnection connection, string tenantId)
    {
        using var command = CreateSettingCommand(connection, tenantId);
        command.ExecuteNonQuery();
    }

    private static async Task ApplyAsync(DbConnection connection, string tenantId, CancellationToken cancellationToken)
    {
        using var command = CreateSettingCommand(connection, tenantId);
        await command.ExecuteNonQueryAsync(cancellationToken).ConfigureAwait(false);
    }

    private static DbCommand CreateSettingCommand(DbConnection connection, string tenantId)
    {
        var command = connection.CreateCommand();

        // is_local = false: the setting must survive for the whole opened connection, not only the
        // statement that set it, or every later query in the same unit of work runs unscoped.
        command.CommandText = $"SELECT set_config('{TenantSettingName}', @tenant, false)";
        var parameter = command.CreateParameter();
        parameter.ParameterName = "@tenant";
        parameter.Value = tenantId;
        command.Parameters.Add(parameter);

        return command;
    }
}
