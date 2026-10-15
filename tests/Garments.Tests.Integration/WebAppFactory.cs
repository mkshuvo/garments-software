using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Garments.Tests.Integration;

/// <summary>
/// Boots the shipped <c>Program</c> rather than a parallel test startup, so what the gate verifies
/// is what deploys. A test host wired differently from production is how the legacy tree convinced
/// itself a subsystem worked.
/// </summary>
public class WebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseEnvironment("Testing");
}
