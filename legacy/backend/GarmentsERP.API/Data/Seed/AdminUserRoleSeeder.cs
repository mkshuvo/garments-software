using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GarmentsERP.API.Data.Seed
{
    public class AdminUserRoleSeeder : IEntityTypeConfiguration<IdentityUserRole<Guid>>
    {
        public void Configure(EntityTypeBuilder<IdentityUserRole<Guid>> builder)
        {
            // Get the admin role ID (we need to match this with the seeded admin role)
            // We'll use the first seeded admin role from the roles seeding
            var superAdminUserId = Guid.Parse("5b6b1d3c-c143-463a-916f-735989ad3f88");
            
            // We need to get the admin role ID from the seeded roles
            // This should match the Admin role ID from the current migration's role seeding
            var adminRoleId = Guid.Parse("bdd250ff-3291-4e1b-b91f-ff58384985c2"); // This should match the Admin role ID from SeedRoles
            
            builder.HasData(new IdentityUserRole<Guid>
            {
                UserId = superAdminUserId,
                RoleId = adminRoleId
            });
        }
    }
}
