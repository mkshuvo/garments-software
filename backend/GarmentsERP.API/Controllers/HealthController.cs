using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using GarmentsERP.API.Data;
using System.Diagnostics;

namespace GarmentsERP.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class HealthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IConnectionMultiplexer _redis;
        private readonly ILogger<HealthController> _logger;

        public HealthController(
            ApplicationDbContext context,
            IConnectionMultiplexer redis,
            ILogger<HealthController> logger)
        {
            _context = context;
            _redis = redis;
            _logger = logger;
        }

        /// <summary>
        /// Basic health check endpoint
        /// </summary>
        [HttpGet]
        public IActionResult Get()
        {
            return Ok(new { status = "healthy", timestamp = DateTime.UtcNow });
        }

        /// <summary>
        /// Detailed health check with all dependencies
        /// </summary>
        [HttpGet("detailed")]
        public async Task<IActionResult> GetDetailed()
        {
            var dbHealth = await CheckDatabaseHealth();
            var redisHealth = await CheckRedisHealth();

            var healthStatus = new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                dependencies = new
                {
                    database = dbHealth,
                    redis = redisHealth,
                    environment = GetEnvironmentInfo()
                }
            };

            var overallHealthy = dbHealth.healthy && redisHealth.healthy;

            if (!overallHealthy)
            {
                return StatusCode(503, new { 
                    status = "unhealthy", 
                    timestamp = DateTime.UtcNow,
                    dependencies = healthStatus.dependencies 
                });
            }

            return Ok(healthStatus);
        }

        /// <summary>
        /// Check database connectivity and migration status
        /// </summary>
        [HttpGet("database")]
        public async Task<IActionResult> CheckDatabase()
        {
            var dbHealth = await CheckDatabaseHealth();
            
            if (!dbHealth.healthy)
            {
                return StatusCode(503, dbHealth);
            }

            return Ok(dbHealth);
        }

        /// <summary>
        /// Check Redis connectivity
        /// </summary>
        [HttpGet("redis")]
        public async Task<IActionResult> CheckRedis()
        {
            var redisHealth = await CheckRedisHealth();
            
            if (!redisHealth.healthy)
            {
                return StatusCode(503, redisHealth);
            }

            return Ok(redisHealth);
        }

        /// <summary>
        /// Kubernetes-style readiness probe - checks if app is ready to receive traffic
        /// </summary>
        [HttpGet("ready")]
        public async Task<IActionResult> Ready()
        {
            try
            {
                var dbHealth = await CheckDatabaseHealth();
                var redisHealth = await CheckRedisHealth();

                var isReady = dbHealth.healthy && redisHealth.healthy;

                var response = new
                {
                    status = isReady ? "ready" : "not_ready",
                    timestamp = DateTime.UtcNow,
                    checks = new
                    {
                        database = dbHealth.healthy,
                        redis = redisHealth.healthy
                    }
                };

                return isReady ? Ok(response) : StatusCode(503, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Readiness check failed");
                return StatusCode(503, new
                {
                    status = "not_ready",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Verify permission seeding status
        /// </summary>
        [HttpGet("permissions")]
        public async Task<IActionResult> CheckPermissions()
        {
            try
            {
                var permissions = await _context.Permissions.ToListAsync();
                var roles = await _context.Roles.ToListAsync();
                var rolePermissions = await _context.RolePermissions.ToListAsync();

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

                var missingPermissions = expectedPermissions
                    .Where(expected => !permissions.Any(p => p.Resource == expected.Resource && p.Action == expected.Action))
                    .Select(p => $"{p.Resource}.{p.Action}")
                    .ToList();

                var expectedRoles = new[] { "Admin", "Manager", "Employee" };
                var missingRoles = expectedRoles
                    .Where(expected => !roles.Any(r => r.Name == expected))
                    .ToList();

                var rolePermissionCounts = roles.ToDictionary(
                    role => role.Name ?? "Unknown",
                    role => rolePermissions.Count(rp => rp.RoleId == role.Id)
                );

                var isHealthy = missingPermissions.Count == 0 && missingRoles.Count == 0;

                var response = new
                {
                    status = isHealthy ? "healthy" : "unhealthy",
                    timestamp = DateTime.UtcNow,
                    permissions = new
                    {
                        total = permissions.Count,
                        expected = expectedPermissions.Length,
                        active = permissions.Count(p => p.IsActive),
                        missing = missingPermissions,
                        allExpectedFound = missingPermissions.Count == 0
                    },
                    roles = new
                    {
                        total = roles.Count,
                        expected = expectedRoles.Length,
                        missing = missingRoles,
                        allExpectedFound = missingRoles.Count == 0,
                        permissionCounts = rolePermissionCounts
                    },
                    rolePermissions = new
                    {
                        totalAssignments = rolePermissions.Count
                    }
                };

                return isHealthy ? Ok(response) : StatusCode(503, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Permission verification failed");
                return StatusCode(500, new
                {
                    status = "error",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        /// <summary>
        /// Kubernetes-style liveness probe - checks if app is alive and should not be restarted
        /// </summary>
        [HttpGet("live")]
        public IActionResult Live()
        {
            try
            {
                // Basic liveness check - if we can respond, we're alive
                var response = new
                {
                    status = "alive",
                    timestamp = DateTime.UtcNow,
                    uptime = DateTime.UtcNow.Subtract(Process.GetCurrentProcess().StartTime.ToUniversalTime()),
                    processId = Environment.ProcessId
                };

                return Ok(response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Liveness check failed");
                return StatusCode(500, new
                {
                    status = "dead",
                    error = ex.Message,
                    timestamp = DateTime.UtcNow
                });
            }
        }

        private async Task<(bool healthy, object response)> CheckDatabaseHealth()
        {
            try
            {
                // Check if database is accessible
                var canConnect = await _context.Database.CanConnectAsync();
                if (!canConnect)
                {
                    var failResponse = new
                    {
                        service = "PostgreSQL",
                        healthy = false,
                        message = "Cannot connect to database",
                        timestamp = DateTime.UtcNow
                    };
                    return (false, failResponse);
                }

                // Check pending migrations
                var pendingMigrations = await _context.Database.GetPendingMigrationsAsync();
                var appliedMigrations = await _context.Database.GetAppliedMigrationsAsync();

                // Test a simple query
                var userCount = await _context.Users.CountAsync();

                var successResponse = new
                {
                    service = "PostgreSQL",
                    healthy = true,
                    message = "Database is accessible and operational",
                    details = new
                    {
                        canConnect = true,
                        userCount = userCount,
                        appliedMigrations = appliedMigrations.Count(),
                        pendingMigrations = pendingMigrations.Count(),
                        hasPendingMigrations = pendingMigrations.Any()
                    },
                    timestamp = DateTime.UtcNow
                };

                return (true, successResponse);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database health check failed");
                var errorResponse = new
                {
                    service = "PostgreSQL",
                    healthy = false,
                    message = $"Database health check failed: {ex.Message}",
                    timestamp = DateTime.UtcNow
                };
                return (false, errorResponse);
            }
        }

        private async Task<(bool healthy, object response)> CheckRedisHealth()
        {
            try
            {
                var database = _redis.GetDatabase();
                
                // Test Redis connectivity with a ping
                var pingResult = await database.PingAsync();
                
                // Test set/get operations
                var testKey = "health_check_test";
                var testValue = DateTime.UtcNow.ToString();
                
                await database.StringSetAsync(testKey, testValue, TimeSpan.FromSeconds(10));
                var retrievedValue = await database.StringGetAsync(testKey);
                await database.KeyDeleteAsync(testKey);                var operationsWork = retrievedValue == testValue;

                // Skip Redis INFO command that requires admin permissions
                var redisVersion = "Connected";

                var response = new
                {
                    service = "Redis",
                    healthy = operationsWork,
                    message = operationsWork ? "Redis is accessible and operational" : "Redis operations failed",
                    details = new
                    {
                        pingLatency = $"{pingResult.TotalMilliseconds:F2}ms",
                        operationsWork = operationsWork,
                        version = redisVersion,
                        isConnected = _redis.IsConnected
                    },
                    timestamp = DateTime.UtcNow
                };

                return (operationsWork, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Redis health check failed");
                var errorResponse = new
                {
                    service = "Redis",
                    healthy = false,
                    message = $"Redis health check failed: {ex.Message}",
                    timestamp = DateTime.UtcNow
                };
                return (false, errorResponse);
            }
        }

        private object GetEnvironmentInfo()
        {
            return new
            {
                environment = Environment.GetEnvironmentVariable("ASPNETCORE_ENVIRONMENT") ?? "Unknown",
                machineName = Environment.MachineName,
                osVersion = Environment.OSVersion.ToString(),
                dotNetVersion = Environment.Version.ToString(),
                workingSet = GC.GetTotalMemory(false),
                timestamp = DateTime.UtcNow
            };
        }
    }
}
