using GarmentsERP.API.Interfaces;
using System.Text.Json;

namespace GarmentsERP.API.Middleware
{
    public class ValidationMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ValidationMiddleware> _logger;

        public ValidationMiddleware(RequestDelegate next, ILogger<ValidationMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context, IBusinessRuleValidator validator)
        {
            // Only validate POST and PUT requests
            if (context.Request.Method == "POST" || context.Request.Method == "PUT")
            {
                // Enable buffering so we can read the request body multiple times
                context.Request.EnableBuffering();

                try
                {
                    // Read the request body
                    var body = await ReadRequestBodyAsync(context.Request);
                    
                    if (!string.IsNullOrWhiteSpace(body))
                    {
                        // Try to determine the model type from the route and validate
                        var modelType = DetermineModelTypeFromRoute(context.Request.Path);
                        
                        if (modelType != null)
                        {
                            var validationResult = await ValidateRequestBody(body, modelType, validator);
                            
                            if (!validationResult.IsValid)
                            {
                                await WriteValidationErrorResponse(context, validationResult);
                                return;
                            }
                        }
                    }

                    // Reset the request body position for the next middleware
                    context.Request.Body.Position = 0;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in validation middleware");
                    // Continue to next middleware even if validation fails
                }
            }

            await _next(context);
        }

        private async Task<string> ReadRequestBodyAsync(HttpRequest request)
        {
            using var reader = new StreamReader(request.Body, leaveOpen: true);
            var body = await reader.ReadToEndAsync();
            request.Body.Position = 0;
            return body;
        }

        private Type? DetermineModelTypeFromRoute(PathString path)
        {
            // Map routes to model types
            var routeModelMap = new Dictionary<string, Type>
            {
                { "/api/CashBookEntry", typeof(object) }, // Would need actual request types
                { "/api/ChartOfAccounts", typeof(object) },
                { "/api/Contact", typeof(object) }
            };

            foreach (var kvp in routeModelMap)
            {
                if (path.StartsWithSegments(kvp.Key))
                {
                    return kvp.Value;
                }
            }

            return null;
        }

        private async Task<BusinessRuleValidationResult> ValidateRequestBody(string body, Type modelType, IBusinessRuleValidator validator)
        {
            try
            {
                // Deserialize the JSON to the appropriate model type
                var model = JsonSerializer.Deserialize(body, modelType, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (model != null)
                {
                    // Use reflection to call the generic ValidateAsync method
                    var method = typeof(IBusinessRuleValidator).GetMethod("ValidateAsync");
                    var genericMethod = method?.MakeGenericMethod(modelType);
                    
                    if (genericMethod != null)
                    {
                        var task = (Task<BusinessRuleValidationResult>?)genericMethod.Invoke(validator, new[] { model });
                        if (task != null)
                        {
                            return await task;
                        }
                    }
                }

                return BusinessRuleValidationResult.Success();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating request body");
                return BusinessRuleValidationResult.Success(); // Don't block on validation errors
            }
        }

        private async Task WriteValidationErrorResponse(HttpContext context, BusinessRuleValidationResult validationResult)
        {
            context.Response.StatusCode = 400;
            context.Response.ContentType = "application/json";

            var response = new
            {
                Success = false,
                Message = validationResult.Message ?? "Validation failed",
                Errors = validationResult.Errors.Select(e => new
                {
                    Field = e.Field,
                    Message = e.Message,
                    Code = e.Code
                }),
                Warnings = validationResult.Warnings.Select(w => new
                {
                    Field = w.Field,
                    Message = w.Message,
                    Code = w.Code
                })
            };

            var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }
    }
}