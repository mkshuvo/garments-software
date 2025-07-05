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
            // Seed super admin user
            var adminUserId = Guid.Parse("5b6b1d3c-c143-463a-916f-735989ad3f88"); // Super Admin ID
            var hasher = new PasswordHasher<ApplicationUser>();
            var adminUser = new ApplicationUser
            {
                Id = adminUserId,
                UserName = "superadmin",
                NormalizedUserName = "SUPERADMIN",
                Email = "superadmin@erp.com",
                NormalizedEmail = "SUPERADMIN@ERP.COM",
                EmailConfirmed = true,
                FullName = "Super Administrator",
                UserType = UserType.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow,
                SecurityStamp = Guid.NewGuid().ToString(),
                PasswordHash = hasher.HashPassword(new ApplicationUser { UserName = "superadmin" }, "SuperAdmin@123")
            };
            builder.HasData(adminUser);
        }
    }
}
