using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Garments.Tests.Integration;

/// <summary>
/// Boots the shipped <c>Program</c> rather than a parallel test startup, so what the gate verifies
/// is what deploys. A test host wired differently from production is how the legacy tree convinced
/// itself a subsystem worked.
/// </summary>
/// <remarks>
/// The connection string is supplied here because the application refuses to start without one, and
/// that refusal is the behaviour under test, not an obstacle. It points at the local dev container;
/// tests that actually read or write must not rely on this one — they bring up their own database,
/// because a tenancy test run against an empty or absent schema proves nothing about row-level
/// security.
/// </remarks>
public class WebAppFactory : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder) =>
        builder.UseEnvironment("Testing")
            .UseSetting(
                "ConnectionStrings:Default",
                Environment.GetEnvironmentVariable("ConnectionStrings__Default")
                    ?? "Host=127.0.0.1;Port=6432;Database=garments_test;Username=postgres;Password=integration_only");
}
