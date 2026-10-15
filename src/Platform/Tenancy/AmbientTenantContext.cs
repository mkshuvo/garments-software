using Garments.Core;

namespace Garments.Platform.Tenancy;

/// <summary>
/// Request-scoped holder for the resolved tenant. Scoped, never singleton: a shared instance across
/// requests is exactly how a tenant identifier leaks from one customer's request into another's.
/// </summary>
public sealed class AmbientTenantContext : ITenantContext
{
    private TenantId? _tenantId;

    public TenantId TenantId =>
        _tenantId ?? throw new InvalidOperationException(
            "No tenant has been resolved for this operation. Every query and every write must be tenant-scoped, "
            + "so an unscoped operation is a defect rather than an empty result.");

    public bool HasTenant => _tenantId is not null;

    /// <summary>Set once per request by the tenancy middleware; a second different value is a bug.</summary>
    public void Set(TenantId tenantId)
    {
        if (tenantId.IsEmpty)
        {
            throw new ArgumentException("A request cannot be scoped to an empty tenant.", nameof(tenantId));
        }

        if (_tenantId is not null && _tenantId != tenantId)
        {
            throw new InvalidOperationException(
                $"Tenant is already resolved to {_tenantId} and cannot be reassigned to {tenantId} within one scope.");
        }

        _tenantId = tenantId;
    }
}
