using Garments.Api.Composition;
using Garments.Api.Health;
using Garments.Api.Observability;
using Garments.Platform.Data;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

// Fails at startup, not at request time, on anything the container cannot actually build.
builder.Host.UseStrictServiceProvider();

builder.Host.UseSerilog((context, services, configuration) => configuration
    .ReadFrom.Configuration(context.Configuration)
    .Enrich.FromLogContext()
    .Enrich.WithProperty("Application", "GarmentsERP"));

// Controllers before authorization, so the pipeline order cannot drift: an authorization service
// without a controller pipeline hides nothing, it just has nothing to protect.
builder.Services.AddControllers();

// Deny by default. An endpoint that is public is public because it is written down, not because
// nobody remembered to lock it. The legacy build shipped a bare AddAuthorization() and an
// unauthenticated POST /api/AdminSetup/create-admin with it.
builder.Services.AddAuthorization();
builder.Services.AddAuthentication();
builder.Services.AddGarmentsObservability();
builder.Services.AddGarmentsHealth();

// Refuses to start without a configured connection rather than coming up and failing on the first
// query, which is how the legacy tree's "dependency check middleware" managed to report healthy
// against a database it had not actually migrated.
builder.Services.AddGarmentsData(PlatformDataServiceCollectionExtensions.ReadDatabaseOptions(builder.Configuration));

var app = builder.Build();

app.UseSerilogRequestLogging();

// Production only: redirecting under a test host turns every probe into a 307 and hides the
// response the test is asserting on. /health is excluded because a load balancer or container
// orchestrator probing over plain HTTP must get a 200, not a redirect it will not follow.
if (app.Environment.IsProduction())
{
    app.UseWhen(
        context => !context.Request.Path.StartsWithSegments("/health"),
        branch => branch.UseHttpsRedirection());
}

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapGarmentsHealth();

app.Run();

/// <summary>
/// Exposed so the test host boots the identical composition root the deployment uses: a DI
/// container that only works under the test host is the failure mode that hid for a year.
/// </summary>
[System.Diagnostics.CodeAnalysis.ExcludeFromCodeCoverage]
public partial class Program;
