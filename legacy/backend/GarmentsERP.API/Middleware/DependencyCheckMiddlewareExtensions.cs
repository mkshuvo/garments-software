using Microsoft.EntityFrameworkCore;
using StackExchange.Redis;
using System.Net.Sockets;
using GarmentsERP.API.Data;

namespace GarmentsERP.API.Middleware
{
    // Extension method to register the middleware
    public static class DependencyCheckMiddlewareExtensions
    {
        public static IApplicationBuilder UseDependencyCheck(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<DependencyCheckMiddleware>();
        }
    }
}
