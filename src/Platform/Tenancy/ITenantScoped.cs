using Garments.Core;

namespace Garments.Platform.Tenancy;

/// <summary>
/// Marks an entity whose rows belong to exactly one tenant. The model builder reads this marker to
/// give the table its tenancy column, its composite index and its check constraint, and the database
/// reads the resulting column for row-level security.
/// </summary>
/// <remarks>
/// <see cref="Tenant"/> deliberately does not implement it. The directory is the one table that must
/// be readable before a tenant is known — otherwise logging in would need the tenant it is trying to
/// establish.
/// </remarks>
public interface ITenantScoped
{
    TenantId TenantId { get; set; }
}
