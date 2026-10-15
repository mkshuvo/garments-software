using Garments.Core;

namespace Garments.Platform.Tenancy;

/// <summary>
/// The tenant the current operation belongs to.
/// </summary>
/// <remarks>
/// Deliberately has no default and no "current tenant" fallback: an unresolvable request must fail
/// before it reaches SQL, because a silently-empty tenant is how one company's ledger ends up in
/// another company's report.
/// </remarks>
public interface ITenantContext
{
    TenantId TenantId { get; }

    /// <summary>False until a request has been authenticated and scoped to a real tenant.</summary>
    bool HasTenant { get; }
}
