namespace Garments.Platform.Rbac;

/// <summary>
/// The permission set each system role is created with. A factory with three people uses two of these
/// rows and a factory with three hundred uses all five, so the roles are named for the function rather
/// than for the headcount.
/// </summary>
/// <remarks>
/// Owner holds the wildcard instead of a copy of the catalogue: a tenant must always be able to
/// re-grant itself after a later phase adds permissions, without a migration that retro-fits rights
/// onto existing tenants and silently changes who can see whose ledger.
/// </remarks>
public static class DefaultRoleMatrix
{
    public const string Owner = "Owner";
    public const string Manager = "Manager";
    public const string Accounts = "Accounts";
    public const string Stock = "Stock";
    public const string Production = "Production";

    public static readonly IReadOnlyList<string> RoleNames = [Owner, Manager, Accounts, Stock, Production];

    private static readonly Dictionary<string, string[]> Grants = new(StringComparer.Ordinal)
    {
        [Owner] = [PermissionCatalogue.WildcardKey],
        [Manager] =
        [
            "tenant.read", "company.read", "company.update",
            "department.read", "department.create", "department.update",
            "user.read", "user.create", "user.update",
            "role.read", "permission.read", "audit.read",
        ],
        [Accounts] =
        [
            "tenant.read", "company.read", "company.update",
            "department.read", "user.read", "permission.read", "audit.read",
        ],
        [Stock] =
        [
            "tenant.read", "company.read",
            "department.read", "department.create", "department.update", "permission.read",
        ],
        [Production] =
        [
            "tenant.read", "company.read",
            "department.read", "department.create", "department.update", "permission.read",
        ],
    };

    public static IReadOnlyList<string> PermissionsFor(string roleName) =>
        Grants.TryGetValue(roleName, out var permissions)
            ? permissions
            : throw new ArgumentException($"'{roleName}' is not a system role.", nameof(roleName));
}
