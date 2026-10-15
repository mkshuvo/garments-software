using Microsoft.AspNetCore.Http;

namespace Garments.Platform.Security;

/// <summary>
/// Who performed the current operation, for the audit trail.
/// </summary>
/// <remarks>
/// <see cref="SourceAddress"/> deliberately reads the connection's remote address and not
/// <c>X-Forwarded-For</c>. The legacy audit service took the first value of that client-supplied
/// header, so any caller could write whatever IP they liked into the evidence trail. Behind a proxy
/// this records the proxy; correcting that needs a configured trusted-proxy count, which is a
/// deployment decision and is not made silently here.
/// </remarks>
public sealed class CurrentActorService(IHttpContextAccessor accessor) : ICurrentActor
{
    public bool IsAuthenticated => accessor.HttpContext?.User.Identity?.IsAuthenticated == true;

    public ActorIdentity? Current
    {
        get
        {
            var context = accessor.HttpContext;

            if (context is null || !context.User.Identity?.IsAuthenticated == true)
            {
                return null;
            }

            return Guid.TryParse(context.User.FindFirst(AuthClaimNames.Subject)?.Value, out var subject)
                ? new ActorIdentity(subject, context.User.FindFirst(AuthClaimNames.FullName)?.Value ?? "unknown")
                : null;
        }
    }

    public string? CorrelationId =>
        accessor.HttpContext?.TraceIdentifier ?? Guid.NewGuid().ToString("N");

    public string? SourceAddress => accessor.HttpContext?.Connection.RemoteIpAddress?.ToString();
}
