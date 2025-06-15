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
            }

            if (!_dependenciesHealthy)
            {
                context.Response.StatusCode = 503;
                context.Response.ContentType = "application/json";
                await context.Response.WriteAsync(System.Text.Json.JsonSerializer.Serialize(new
                {
                    error = "Service dependencies are not healthy. Please ensure PostgreSQL, Redis, and other required services are running.",
                    timestamp = DateTime.UtcNow,
                    details = "Check Docker containers: postgres, redis, nginx"
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

            var allHealthy = true;

            // Check PostgreSQL
            try
            {
                _logger.LogInformation("Checking PostgreSQL connection...");
                var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                await context.Database.CanConnectAsync();
                
                // Also verify we can query the database
                var canQuery = await context.Database.ExecuteSqlRawAsync("SELECT 1") >= 0;
                
                _logger.LogInformation("✅ PostgreSQL connection: OK");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ PostgreSQL connection failed - CRITICAL");
                allHealthy = false;
            }

            // Check Redis
            try
            {
                _logger.LogInformation("Checking Redis connection...");
                var redis = scope.ServiceProvider.GetRequiredService<IConnectionMultiplexer>();
                var database = redis.GetDatabase();
                await database.PingAsync();
                
                // Test basic operations
                await database.StringSetAsync("health_check", "ok", TimeSpan.FromSeconds(5));
                var result = await database.StringGetAsync("health_check");
                await database.KeyDeleteAsync("health_check");
                
                _logger.LogInformation("✅ Redis connection: OK");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ Redis connection failed - CRITICAL");
                allHealthy = false;
            }

            // In development, check additional services
            if (environment.IsDevelopment())
            {
                _logger.LogInformation("🧪 Development mode: Checking additional services...");

                // Check pgAdmin accessibility (via PostgreSQL port)
                var pgAdminOk = await CheckServicePortAsync("postgres", 5432, "pgAdmin (PostgreSQL)");
                if (!pgAdminOk)
                {
                    _logger.LogWarning("⚠️ pgAdmin may not be accessible");
                }

                // Check Redis Commander accessibility (via Redis port)
                var redisCommanderOk = await CheckServicePortAsync("redis", 6379, "Redis Commander (Redis)");
                if (!redisCommanderOk)
                {
                    _logger.LogWarning("⚠️ Redis Commander may not be accessible");
                }

                // Check MailHog (optional service)
                var mailhogSmtpOk = await CheckServicePortAsync("mailhog", 1025, "MailHog SMTP");
                var mailhogWebOk = await CheckServicePortAsync("mailhog", 8025, "MailHog Web UI");
                if (!mailhogSmtpOk || !mailhogWebOk)
                {
                    _logger.LogInformation("ℹ️ MailHog not available (optional for email testing)");
                }
            }

            // Check Nginx (if running in containerized environment)
            try
            {
                var nginxOk = await CheckServicePortAsync("nginx", 80, "Nginx Reverse Proxy");
                if (!nginxOk)
                {
                    _logger.LogWarning("⚠️ Nginx reverse proxy may not be running");
                }
            }
            catch
            {
                // Nginx check is optional in development
                _logger.LogInformation("ℹ️ Nginx check skipped (may be running in development mode)");
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
        }

        private async Task<bool> CheckServicePortAsync(string host, int port, string serviceName)
        {
            try
            {
                _logger.LogInformation("Checking {ServiceName} at {Host}:{Port}...", serviceName, host, port);
                
                using var tcpClient = new TcpClient();
                var connectTask = tcpClient.ConnectAsync(host, port);
                
                // Wait up to 10 seconds for connection
                var timeoutTask = Task.Delay(10000);
                var completedTask = await Task.WhenAny(connectTask, timeoutTask);
                
                if (completedTask == connectTask && !connectTask.IsFaulted && tcpClient.Connected)
                {
                    _logger.LogInformation("✅ {ServiceName}: OK", serviceName);
                    return true;
                }
                else
                {
                    _logger.LogWarning("⚠️ {ServiceName}: Not accessible", serviceName);
                    return false;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "⚠️ {ServiceName}: Check failed", serviceName);
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
