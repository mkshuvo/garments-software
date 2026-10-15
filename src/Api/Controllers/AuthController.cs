using Garments.Platform.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Garments.Api.Controllers;

/// <summary>Sign-in and self-introspection.</summary>
[ApiController]
[Route("api/v1/auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    /// <summary>
    /// Exchanges credentials for an access token bound to one tenant.
    /// </summary>
    /// <remarks>
    /// Allow-listed in <c>anonymous-allowlist.txt</c>. The response carries no stack traces and no
    /// detail distinguishing an unknown account from a wrong password.
    /// </remarks>
    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequest request,
        CancellationToken cancellationToken)
    {
        var outcome = await authService.SignInAsync(request, cancellationToken);

        if (!outcome.Succeeded || outcome.Token is null)
        {
            return Unauthorized(new { reason = outcome.Reason.ToString() });
        }

        return Ok(new
        {
            token = outcome.Token.Token,
            expiresAt = outcome.Token.ExpiresAtUtc,
            roles = outcome.Roles ?? [],
        });
    }
}
