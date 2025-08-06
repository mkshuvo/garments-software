using System.Security.Claims;
using GarmentsERP.API.Models;

namespace GarmentsERP.API.Services.Interfaces
{
    public interface IJwtService
    {
        string GenerateToken(ApplicationUser user, IList<string> roles);
        ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
        string GenerateRefreshToken();
        bool ValidateToken(string token);
    }
}