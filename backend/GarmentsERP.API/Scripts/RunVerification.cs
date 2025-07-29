using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using GarmentsERP.API.Data;
using GarmentsERP.API.Scripts;

namespace GarmentsERP.API.Scripts
{
    public class RunVerification
    {
        public static async Task Main(string[] args)
        {
            // Build configuration
            var configuration = new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json")
                .AddJsonFile("appsettings.Development.json", optional: true)
                .Build();

            // Setup DbContext
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseNpgsql(connectionString)
                .Options;

            using var context = new ApplicationDbContext(options);

            try
            {
                var success = await VerifyPermissionSeeding.VerifyPermissionsAsync(context);
                Environment.Exit(success ? 0 : 1);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Error during verification: {ex.Message}");
                Environment.Exit(1);
            }
        }
    }
}