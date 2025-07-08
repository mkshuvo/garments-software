using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using GarmentsERP.API.Data;
using GarmentsERP.API.Models;
using GarmentsERP.API.Models.Users;

namespace GarmentsERP.API.CLI
{
    /// <summary>
    /// Professional CLI tool for creating the first admin user in GarmentsERP
    /// This should only be used for initial system setup
    /// </summary>
    public class AdminSetup
    {
        // Removed Main method. Use RunAsync from Program.cs when needed.
        public static async Task<int> RunAsync(string[] args)
        {
            try
            {
                // Parse command line arguments
                var options = ParseArguments(args);
                if (options == null) return 1;

                if (options.ShowHelp)
                {
                    ShowHelp();
                    return 0;
                }

                if (!options.IsValid())
                {
                    Console.WriteLine("❌ Username and password are required.");
                    ShowHelp();
                    return 1;
                }

                await CreateAdminUserAsync(options);
                return 0;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Fatal error: {ex.Message}");
                if (ex.InnerException != null)
                {
                    Console.WriteLine($"   Inner exception: {ex.InnerException.Message}");
                }
                return 1;
            }
        }

        private static AdminSetupOptions? ParseArguments(string[] args)
        {
            var options = new AdminSetupOptions();

            for (int i = 0; i < args.Length; i++)
            {
                switch (args[i].ToLower())
                {
                    case "--username":
                    case "-u":
                        if (i + 1 < args.Length) options.Username = args[++i];
                        break;
                    case "--password":
                    case "-p":
                        if (i + 1 < args.Length) options.Password = args[++i];
                        break;
                    case "--email":
                    case "-e":
                        if (i + 1 < args.Length) options.Email = args[++i];
                        break;
                    case "--fullname":
                    case "-f":
                        if (i + 1 < args.Length) options.FullName = args[++i];
                        break;
                    case "--help":
                    case "-h":
                        options.ShowHelp = true;
                        break;
                }
            }

            return options;
        }

        private static void ShowHelp()
        {
            Console.WriteLine("GarmentsERP Admin Setup Tool");
            Console.WriteLine("============================");
            Console.WriteLine();
            Console.WriteLine("Usage:");
            Console.WriteLine("  dotnet run --project cli/AdminSetup.csproj -- --username <username> --password <password> [options]");
            Console.WriteLine();
            Console.WriteLine("Required Arguments:");
            Console.WriteLine("  -u, --username    Username for the admin user");
            Console.WriteLine("  -p, --password    Password for the admin user");
            Console.WriteLine();
            Console.WriteLine("Optional Arguments:");
            Console.WriteLine("  -e, --email       Email for the admin user (default: <username>@company.com)");
            Console.WriteLine("  -f, --fullname    Full name for the admin user (default: System Administrator)");
            Console.WriteLine("  -h, --help        Show this help message");
            Console.WriteLine();
            Console.WriteLine("Examples:");
            Console.WriteLine("  dotnet run --project cli/AdminSetup.csproj -- -u admin -p secretpassword");
            Console.WriteLine("  dotnet run --project cli/AdminSetup.csproj -- --username admin --password mypass123 --email admin@company.com");
            Console.WriteLine();
            Console.WriteLine("Security Notes:");
            Console.WriteLine("  • Use a strong password (minimum 6 characters, with uppercase, lowercase, and digits)");
            Console.WriteLine("  • This tool should only be used for initial setup");
            Console.WriteLine("  • Only one admin user can be created this way");
            Console.WriteLine("  • Additional users should be created through the web interface");
        }

        private static async Task CreateAdminUserAsync(AdminSetupOptions options)
        {
            Console.WriteLine("🚀 GarmentsERP Admin Setup");
            Console.WriteLine("==========================");
            Console.WriteLine();

            // Validate inputs
            if (!ValidateInputs(options))
            {
                return;
            }

            // Set defaults if not provided
            options.Email ??= $"{options.Username}@company.com";
            options.FullName ??= "System Administrator";

            Console.WriteLine($"👤 Creating admin user: {options.Username}");
            Console.WriteLine($"📧 Email: {options.Email}");
            Console.WriteLine($"👨‍💼 Full Name: {options.FullName}");
            Console.WriteLine();

            // Build configuration
            var configuration = BuildConfiguration();
            var serviceProvider = BuildServiceProvider(configuration);

            try
            {
                using var scope = serviceProvider.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
                var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<ApplicationRole>>();

                // Validate database connection
                if (!await ValidateDatabase(context))
                {
                    return;
                }

                // Check for existing admin users
                if (await HasExistingAdminUsers(userManager))
                {
                    return;
                }

                // Check for existing username/email
                if (await HasExistingUser(userManager, options))
                {
                    return;
                }

                // Create admin role if needed
                await EnsureAdminRole(roleManager);

                // Create the admin user
                await CreateUser(userManager, options);

                ShowSuccessMessage(options);
            }
            finally
            {
                await serviceProvider.DisposeAsync();
            }
        }

        private static bool ValidateInputs(AdminSetupOptions options)
        {
            if (string.IsNullOrWhiteSpace(options.Username))
            {
                Console.WriteLine("❌ Username cannot be empty");
                return false;
            }

            if (string.IsNullOrWhiteSpace(options.Password))
            {
                Console.WriteLine("❌ Password cannot be empty");
                return false;
            }

            if (options.Password.Length < 6)
            {
                Console.WriteLine("❌ Password must be at least 6 characters long");
                return false;
            }

            if (!options.Password.Any(char.IsUpper))
            {
                Console.WriteLine("❌ Password must contain at least one uppercase letter");
                return false;
            }

            if (!options.Password.Any(char.IsLower))
            {
                Console.WriteLine("❌ Password must contain at least one lowercase letter");
                return false;
            }

            if (!options.Password.Any(char.IsDigit))
            {
                Console.WriteLine("❌ Password must contain at least one digit");
                return false;
            }

            return true;
        }

        private static IConfiguration BuildConfiguration()
        {
            return new ConfigurationBuilder()
                .SetBasePath(Directory.GetCurrentDirectory())
                .AddJsonFile("appsettings.json", optional: false)
                .AddJsonFile("appsettings.Development.json", optional: true)
                .AddEnvironmentVariables()
                .Build();
        }

        private static ServiceProvider BuildServiceProvider(IConfiguration configuration)
        {
            var services = new ServiceCollection();
            services.AddSingleton<IConfiguration>(configuration);
            services.AddLogging(builder => builder.AddConsole().SetMinimumLevel(LogLevel.Warning));

            // Add Entity Framework
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            if (string.IsNullOrEmpty(connectionString))
            {
                throw new InvalidOperationException("Database connection string not found in configuration");
            }

            services.AddDbContext<ApplicationDbContext>(options =>
                options.UseNpgsql(connectionString));

            // Add Identity services
            services.AddIdentity<ApplicationUser, ApplicationRole>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequiredLength = 6;
                options.Password.RequireNonAlphanumeric = false;
                options.Password.RequireUppercase = true;
                options.Password.RequireLowercase = true;
                options.User.RequireUniqueEmail = true;
            })
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

            return services.BuildServiceProvider();
        }

        private static async Task<bool> ValidateDatabase(ApplicationDbContext context)
        {
            Console.WriteLine("🔄 Checking database connection...");

            try
            {
                await context.Database.MigrateAsync();
                Console.WriteLine("✅ Database connection successful");
                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Database connection failed: {ex.Message}");
                Console.WriteLine("   Make sure the database server is running and connection string is correct");
                return false;
            }
        }

        private static async Task<bool> HasExistingAdminUsers(UserManager<ApplicationUser> userManager)
        {
            var usersInAdminRole = await userManager.GetUsersInRoleAsync("Admin");
            if (usersInAdminRole.Any())
            {
                Console.WriteLine("⚠️  Admin users already exist in the system");
                Console.WriteLine("   This tool should only be used for initial setup");
                Console.WriteLine("   Use the web interface to create additional users");
                return true;
            }
            return false;
        }

        private static async Task<bool> HasExistingUser(UserManager<ApplicationUser> userManager, AdminSetupOptions options)
        {
            // Check if username already exists
            var existingUser = await userManager.FindByNameAsync(options.Username!);
            if (existingUser != null)
            {
                Console.WriteLine($"❌ User with username '{options.Username}' already exists");
                return true;
            }

            // Check if email already exists
            var existingEmailUser = await userManager.FindByEmailAsync(options.Email!);
            if (existingEmailUser != null)
            {
                Console.WriteLine($"❌ User with email '{options.Email}' already exists");
                return true;
            }

            return false;
        }

        private static async Task EnsureAdminRole(RoleManager<ApplicationRole> roleManager)
        {
            if (!await roleManager.RoleExistsAsync("Admin"))
            {
                var adminRole = new ApplicationRole
                {
                    Name = "Admin",
                    Description = "System Administrator with full access"
                };
                var roleResult = await roleManager.CreateAsync(adminRole);
                if (!roleResult.Succeeded)
                {
                    throw new InvalidOperationException($"Failed to create Admin role: {string.Join(", ", roleResult.Errors.Select(e => e.Description))}");
                }
                Console.WriteLine("✅ Admin role created");
            }
        }

        private static async Task CreateUser(UserManager<ApplicationUser> userManager, AdminSetupOptions options)
        {
            Console.WriteLine("🔄 Creating admin user...");

            // Create the admin user
            var adminUser = new ApplicationUser
            {
                UserName = options.Username,
                Email = options.Email,
                FullName = options.FullName ?? "System Administrator",
                EmailConfirmed = true,
                IsActive = true,
                UserType = UserType.Employee
            };

            var userResult = await userManager.CreateAsync(adminUser, options.Password!);
            if (!userResult.Succeeded)
            {
                throw new InvalidOperationException($"Failed to create user: {string.Join(", ", userResult.Errors.Select(e => e.Description))}");
            }

            // Add user to Admin role
            var roleAssignResult = await userManager.AddToRoleAsync(adminUser, "Admin");
            if (!roleAssignResult.Succeeded)
            {
                throw new InvalidOperationException($"Failed to assign Admin role: {string.Join(", ", roleAssignResult.Errors.Select(e => e.Description))}");
            }

            options.UserId = adminUser.Id.ToString();
        }

        private static void ShowSuccessMessage(AdminSetupOptions options)
        {
            Console.WriteLine();
            Console.WriteLine("🎉 SUCCESS!");
            Console.WriteLine("============");
            Console.WriteLine($"✅ Admin user '{options.Username}' created successfully");
            Console.WriteLine($"📧 Email: {options.Email}");
            Console.WriteLine($"🔑 Role: Admin");
            Console.WriteLine($"🆔 User ID: {options.UserId}");
            Console.WriteLine();
            Console.WriteLine("You can now:");
            Console.WriteLine("• Start the application with: dotnet run");
            Console.WriteLine("• Login with the created credentials");
            Console.WriteLine("• Create additional users through the web interface");
            Console.WriteLine();
            Console.WriteLine("⚠️  Security Note: This is the only way to create the first admin user.");
            Console.WriteLine("   Keep your credentials secure!");
        }
    }

    public class AdminSetupOptions
    {
        public string? Username { get; set; }
        public string? Password { get; set; }
        public string? Email { get; set; }
        public string? FullName { get; set; }
        public bool ShowHelp { get; set; }
        public string? UserId { get; set; }

        public bool IsValid()
        {
            return !string.IsNullOrEmpty(Username) && !string.IsNullOrEmpty(Password);
        }
    }
}
