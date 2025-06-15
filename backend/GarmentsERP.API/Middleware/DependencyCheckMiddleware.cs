using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Net.Sockets;
using GarmentsERP.API.Data;

namespace GarmentsERP.API.Middleware
{
    public class DependencyCheckMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<DependencyCheckMiddleware> _logger;
        private readonly IServiceProvider _serviceProvider;
        private static bool _dependenciesChecked = false;
        private static bool _dependenciesHealthy = false;
        private static readonly object _lock = new object();

        public DependencyCheckMiddleware(
            RequestDelegate next, 
            ILogger<DependencyCheckMiddleware> logger,
            IServiceProvider serviceProvider)
        {
            _next = next;
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip dependency check for health endpoints to avoid circular dependency
            if (context.Request.Path.StartsWithSegments("/health"))
            {
                await _next(context);
                return;
            }

            // Check dependencies only once on startup with thread safety
            if (!_dependenciesChecked)
            {
                lock (_lock)
                {
                    if (!_dependenciesChecked)
                    {
                        _dependenciesHealthy = CheckDependenciesSync().Result;
                        _dependenciesChecked = true;
                    }
                }
            }            if (!_dependenciesHealthy)
            {
                context.Response.StatusCode = 503;
                context.Response.ContentType = "application/json";
                
                var environment = _serviceProvider.GetRequiredService<IWebHostEnvironment>();
                var composeFile = environment.IsDevelopment() ? "docker-compose.dev.yml" : "docker-compose.yml";
                
                await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
                {
                    error = "Service dependencies are not healthy. Please ensure all required services are running.",
                    timestamp = DateTime.UtcNow,
                    environment = environment.EnvironmentName,
                    details = $"Check Docker containers with: docker-compose -f {composeFile} ps",
                    requiredServices = environment.IsDevelopment() 
                        ? new[] { "postgres", "redis", "pgadmin", "redis-commander", "mailhog" }
                        : new[] { "postgres", "redis", "nginx", "pgadmin", "redis-commander" },
                    troubleshooting = $"Run: docker-compose -f {composeFile} up -d"
                }));
                return;
            }

            await _next(context);
        }

        private async Task<bool> CheckDependenciesSync()
        {
            _logger.LogInformation("🔍 Starting comprehensive dependency health checks...");

            using var scope = _serviceProvider.CreateScope();
            var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();
            var environment = scope.ServiceProvider.GetRequiredService<IWebHostEnvironment>();

            var allHealthy = true;            // Check PostgreSQL
            try
            {
                _logger.LogInformation("Checking PostgreSQL connection...");
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                // Test basic connectivity
                var canConnect = await context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    throw new InvalidOperationException("Cannot connect to PostgreSQL database");
                }
                
                // Verify we can query the database
                var queryResult = await context.Database.ExecuteSqlRawAsync("SELECT 1");
                
                // Get database name for verification
                var dbName = environment.IsDevelopment() ? "GarmentsERP_Dev" : "GarmentsERP";
                _logger.LogInformation("✅ PostgreSQL connection to '{DatabaseName}': OK", dbName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ PostgreSQL connection failed - CRITICAL");
                _logger.LogError("Ensure PostgreSQL container is running: docker-compose ps postgres");
                allHealthy = false;
            }// Check Redis
            try
            {
                _logger.LogInformation("Checking Redis connection...");
                var redis = scope.ServiceProvider.GetRequiredService<IConnectionMultiplexer>();
                var database = redis.GetDatabase();
                
                // Test basic Redis operations
                var pingResult = await database.PingAsync();
                _logger.LogInformation("Redis ping response: {PingTime}ms", pingResult.TotalMilliseconds);
                
                // Test basic operations
                var testKey = $"health_check_{DateTime.UtcNow.Ticks}";
                await database.StringSetAsync(testKey, "ok", TimeSpan.FromSeconds(5));
                var result = await database.StringGetAsync(testKey);
                await database.KeyDeleteAsync(testKey);
                
                if (result == "ok")
                {
                    _logger.LogInformation("✅ Redis connection and operations: OK");
                }
                else
                {
                    throw new InvalidOperationException("Redis read/write test failed");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Redis connection failed - CRITICAL");
                _logger.LogError("Ensure Redis container is running: docker-compose ps redis");
                allHealthy = false;
            }// In development, check additional services
            if (environment.IsDevelopment())
            {
                _logger.LogInformation("🧪 Development mode: Checking additional services...");

                // Check pgAdmin service directly
                var pgAdminOk = await CheckServicePortAsync("pgadmin", 80, "pgAdmin Web Interface");
                if (!pgAdminOk)
                {
                    _logger.LogWarning("⚠️ pgAdmin Web Interface may not be accessible");
                }

                // Check Redis Commander service directly
                var redisCommanderOk = await CheckServicePortAsync("redis-commander", 8081, "Redis Commander Web Interface");
                if (!redisCommanderOk)
                {
                    _logger.LogWarning("⚠️ Redis Commander Web Interface may not be accessible");
                }

                // Check MailHog service (SMTP and Web UI)
                var mailhogSmtpOk = await CheckServicePortAsync("mailhog", 1025, "MailHog SMTP");
                var mailhogWebOk = await CheckServicePortAsync("mailhog", 8025, "MailHog Web UI");
                if (!mailhogSmtpOk || !mailhogWebOk)
                {
                    _logger.LogInformation("ℹ️ MailHog not available (optional for email testing)");
                }
            }
            else
            {
                _logger.LogInformation("🏭 Production mode: Checking production services...");

                // In production, check pgAdmin and Redis Commander with authentication
                var pgAdminOk = await CheckServicePortAsync("pgadmin", 80, "pgAdmin Production Interface");
                if (!pgAdminOk)
                {
                    _logger.LogWarning("⚠️ pgAdmin Production Interface may not be accessible");
                }

                var redisCommanderOk = await CheckServicePortAsync("redis-commander", 8081, "Redis Commander Production Interface");
                if (!redisCommanderOk)
                {
                    _logger.LogWarning("⚠️ Redis Commander Production Interface may not be accessible");
                }

                // Check Nginx (critical in production)
                var nginxOk = await CheckServicePortAsync("nginx", 80, "Nginx Reverse Proxy");
                if (!nginxOk)
                {
                    _logger.LogError("❌ Nginx reverse proxy is not accessible - this may affect application routing");
                }
            }

            if (allHealthy)
            {
                _logger.LogInformation("🚀 All critical dependencies are healthy! Application starting...");
            }
            else
            {
                _logger.LogError("💥 Critical dependencies failed! Application will not start.");
                _logger.LogError("Please ensure Docker containers are running: docker-compose up -d");
            }

            return allHealthy;
        }        private async Task<bool> CheckServicePortAsync(string host, int port, string serviceName)
        {
            try
            {
                _logger.LogInformation("Checking {ServiceName} at {Host}:{Port}...", serviceName, host, port);
                
                using var tcpClient = new TcpClient();
                
                // Set timeouts
                tcpClient.ReceiveTimeout = 5000;
                tcpClient.SendTimeout = 5000;
                
                var connectTask = tcpClient.ConnectAsync(host, port);
                
                // Wait up to 5 seconds for connection (reduced from 10 for faster startup)
                var timeoutTask = Task.Delay(5000);
                var completedTask = await Task.WhenAny(connectTask, timeoutTask);
                
                if (completedTask == connectTask && !connectTask.IsFaulted && tcpClient.Connected)
                {
                    _logger.LogInformation("✅ {ServiceName}: OK", serviceName);
                    return true;
                }
                else if (completedTask == timeoutTask)
                {
                    _logger.LogWarning("⚠️ {ServiceName}: Connection timeout after 5 seconds", serviceName);
                    return false;
                }
                else
                {
                    _logger.LogWarning("⚠️ {ServiceName}: Connection failed - {Error}", serviceName, 
                        connectTask.Exception?.GetBaseException()?.Message ?? "Unknown error");
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "⚠️ {ServiceName}: Check failed - {Error}", serviceName, ex.Message);
                return false;
            }
        }
    }

    // Extension method to register the middleware
    public static class DependencyCheckMiddlewareExtensions
    {
        public static IApplicationBuilder UseDependencyCheck(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<DependencyCheckMiddleware>();
        }
    }
}
