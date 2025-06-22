using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using GarmentsERP.API.Data;

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
