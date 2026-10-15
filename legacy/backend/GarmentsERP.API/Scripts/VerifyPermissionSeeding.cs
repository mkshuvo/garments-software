using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.Scripts
{
    public class VerifyPermissionSeeding
    {
        public static async Task<bool> VerifyPermissionsAsync(ApplicationDbContext context)
        {
            Console.WriteLine("🔍 Verifying permission seeding...");

            // Check if all required permissions exist
            var expectedPermissions = new[]
            {
                new { Resource = "Category", Action = "View" },
                new { Resource = "Category", Action = "Create" },
                new { Resource = "Category", Action = "Update" },
                new { Resource = "Category", Action = "Delete" },
                new { Resource = "User", Action = "View" },
                new { Resource = "User", Action = "Create" },
                new { Resource = "User", Action = "Update" },
                new { Resource = "User", Action = "Delete" },
                new { Resource = "Role", Action = "View" },
                new { Resource = "Role", Action = "Create" },
                new { Resource = "Role", Action = "Update" },
                new { Resource = "Role", Action = "Delete" },
                new { Resource = "Permission", Action = "View" },
                new { Resource = "Permission", Action = "Create" },
                new { Resource = "Permission", Action = "Update" },
                new { Resource = "Permission", Action = "Delete" }
            };

            var allPermissions = await context.Permissions.ToListAsync();
            Console.WriteLine($"📊 Total permissions in database: {allPermissions.Count}");

            var missingPermissions = new List<string>();
            foreach (var expected in expectedPermissions)
            {
                var exists = allPermissions.Any(p => p.Resource == expected.Resource && p.Action == expected.Action);
                if (!exists)
                {
                    missingPermissions.Add($"{expected.Resource}.{expected.Action}");
                }
                else
                {
                    Console.WriteLine($"✅ {expected.Resource}.{expected.Action}");
                }
            }

            if (missingPermissions.Any())
            {
                Console.WriteLine($"❌ Missing permissions: {string.Join(", ", missingPermissions)}");
                return false;
            }

            // Check role assignments
            var roles = await context.Roles.ToListAsync();
            Console.WriteLine($"\n📊 Total roles in database: {roles.Count}");

            var rolePermissions = await context.RolePermissions.ToListAsync();
            Console.WriteLine($"📊 Total role-permission assignments: {rolePermissions.Count}");

            foreach (var role in roles)
            {
                var assignedPermissions = rolePermissions.Where(rp => rp.RoleId == role.Id).Count();
                Console.WriteLine($"🔑 {role.Name}: {assignedPermissions} permissions assigned");
            }

            Console.WriteLine("\n✅ Permission seeding verification completed successfully!");
            return true;
        }
    }
}