using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace GarmentsERP.API.Data.Seed
{
    public class AdminUserSeeder : IEntityTypeConfiguration<ApplicationUser>
    {
        public void Configure(EntityTypeBuilder<ApplicationUser> builder)
        {
            // Seed admin user
            var adminUserId = Guid.Parse("11111111-1111-1111-1111-111111111111");
            var adminRoleId = Guid.Parse("22222222-2222-2222-2222-222222222222"); // Must match seeded role
            var hasher = new PasswordHasher<ApplicationUser>();
            var adminUser = new ApplicationUser
            {
                Id = adminUserId,
                UserName = "admin",
                NormalizedUserName = "ADMIN",
                Email = "admin@erp.com",
                NormalizedEmail = "ADMIN@ERP.COM",
                EmailConfirmed = true,
                FullName = "System Administrator",
                UserType = UserType.Admin,
                IsActive = true,
                SecurityStamp = Guid.NewGuid().ToString(),
                PasswordHash = hasher.HashPassword(new ApplicationUser { UserName = "admin" }, "Admin@123")
            };
            builder.HasData(adminUser);
        }
    }

    public class AdminUserRoleSeeder : IEntityTypeConfiguration<IdentityUserRole<Guid>>
    {
        public void Configure(EntityTypeBuilder<IdentityUserRole<Guid>> builder)
        {
            builder.HasData(new IdentityUserRole<Guid>
            {
                UserId = Guid.Parse("11111111-1111-1111-1111-111111111111"),
                RoleId = Guid.Parse("22222222-2222-2222-2222-222222222222")
            });
        }
    }
}
