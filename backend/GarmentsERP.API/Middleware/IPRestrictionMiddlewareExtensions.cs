using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Net;
using System.Text.Json;

namespace GarmentsERP.API.Middleware
{
    // Extension method for easy middleware registration
    public static class IPRestrictionMiddlewareExtensions
    {
        public static IApplicationBuilder UseIPRestriction(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<IPRestrictionMiddleware>();
        }
    }
}
