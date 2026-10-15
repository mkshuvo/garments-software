namespace Garments.Platform.Rbac;

/// <summary>
/// The single source of truth for what can be authorised. The migration seeds these rows, the
/// provisioner grants them to roles, and the policy provider mints a policy per key — so a permission
/// that is not written down here does not exist anywhere.
/// </summary>
/// <remarks>
/// A <c>(resource, action)</c> pair rather than ad-hoc role names, because the buyer's staff is hired
/// by function: the accounts clerk needs <c>company.update</c> and nothing else, and that decision must
/// survive the clerk also being called "Senior Officer" in another factory.
/// </remarks>
public static class PermissionCatalogue
{
    public const string AnyResource = "*";
    public const string AnyAction = "*";
    public const string WildcardKey = AnyResource + "." + AnyAction;

    private static readonly PermissionDefinition[] Definitions =
    [
        new("tenant", "read", "See the tenant record this account belongs to."),
        new("company", "read", "Read the company profile: legal name, TIN, address."),
        new("company", "update", "Change the company profile that appears on documents."),
        new("department", "read", "List departments and open one by identifier."),
        new("department", "create", "Add a department."),
        new("department", "update", "Rename, reorder or activate a department."),
        new("department", "delete", "Remove a department."),
        new("user", "read", "List the tenant's users and open one by identifier."),
        new("user", "create", "Invite a user into this tenant."),
        new("user", "update", "Change a user's name, state or role assignments."),
        new("user", "delete", "Remove a user from this tenant."),
        new("role", "read", "List roles and the permissions each one holds."),
        new("role", "create", "Add a custom role."),
        new("role", "update", "Change a role's permissions."),
        new("role", "delete", "Remove a custom role."),
        new("permission", "read", "Read the permission catalogue."),
        new("audit", "read", "Read the tenant's audit trail."),
    ];

    public static IReadOnlyList<PermissionDefinition> All => Definitions;

    public static string Key(string resource, string action) => $"{resource}.{action}";

    public static bool TryResolve(string key, out PermissionDefinition definition)
    {
        var (resource, action) = Split(key);
        foreach (var candidate in Definitions)
        {
            if (string.Equals(candidate.Resource, resource, StringComparison.Ordinal)
                && string.Equals(candidate.Action, action, StringComparison.Ordinal))
            {
                definition = candidate;
                return true;
            }
        }

        definition = null!;
        return false;
    }

    public static bool IsKnown(string resource, string action) =>
        Definitions.Any(definition =>
            string.Equals(definition.Resource, resource, StringComparison.Ordinal)
            && string.Equals(definition.Action, action, StringComparison.Ordinal));

    private static (string Resource, string Action) Split(string key)
    {
        var separator = key.IndexOf('.', StringComparison.Ordinal);
        return separator < 0
            ? (key, AnyAction)
            : (key[..separator], key[(separator + 1)..]);
    }
}
