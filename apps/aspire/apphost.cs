#:package CommunityToolkit.Aspire.Hosting.Ngrok@13.3.0
#:package Aspire.Hosting.JavaScript@13.3.5
#:package Aspire.Hosting.PostgreSQL@13.3.5
#:package Aspire.Hosting.Redis@13.3.5
#:sdk Aspire.AppHost.Sdk@13.3.5

using System.IO;
using System.Text.Json;

var builder = DistributedApplication.CreateBuilder(args);

// Attempt to load a repo-level example-app config and use its `androidUrlScheme`
// as the default mobile-app-url-scheme parameter. This makes the AppHost
// pick up the same scheme used across the workspace when present.
string defaultMobileScheme = "exampleapp";
try
{
    var cwd = Directory.GetCurrentDirectory();
    var candidates = new[] {
        Path.Combine(cwd, "..", "..", "config", "example-app.json"),
        Path.Combine(cwd, "..", "config", "example-app.json"),
        Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "config", "example-app.json"),
        Path.Combine(cwd, "config", "example-app.json"),
        "config/example-app.json"
    };

    foreach (var c in candidates)
    {
        try
        {
            var full = Path.GetFullPath(c);
            if (!File.Exists(full)) continue;
            using var stream = File.OpenRead(full);
            using var doc = JsonDocument.Parse(stream);
            if (doc.RootElement.TryGetProperty("androidUrlScheme", out var prop) && prop.ValueKind == JsonValueKind.String)
            {
                var v = prop.GetString();
                if (!string.IsNullOrWhiteSpace(v))
                {
                    defaultMobileScheme = v;
                }
            }
            break;
        }
        catch { /* best-effort; ignore parse/read errors */ }
    }
}
catch { }

var postgres = builder.AddPostgres("postgres")
    .WithDataVolume()
    .WithPgAdmin();

var database = postgres.AddDatabase("enfdb");

var redis = builder.AddRedis("redis");

var betterAuthApiKey = builder.AddParameter("better-auth-api-key", secret: true);
var auth = builder.AddNodeApp("web-auth", "../web", "server/index.js")
    .WithRunScript("auth:dev")
    .WithPnpm()
    .WithEnvironment(e =>
    {
        e.EnvironmentVariables.Add("AUTH_DATABASE_URL", database.Resource.ConnectionStringExpression);
        e.EnvironmentVariables.Add("BETTER_AUTH_API_KEY", betterAuthApiKey);
    })
    .WithHttpEndpoint(env: "PORT")
    .WithUrlForEndpoint("http", e =>
    {
        e.Url = "/api/studio";
    })
    .WaitFor(database);

var api = builder.AddProject("api", "../api/Api.csproj")
    .WithReference(database)
    .WithReference(redis)
    .WithEnvironment(e =>
    {
        e.EnvironmentVariables.Add("Auth__Authority", auth.GetEndpoint("http").Url);
        e.EnvironmentVariables.Add("Sumsub__AppToken", builder.Configuration["Sumsub:AppToken"] ?? "");
        e.EnvironmentVariables.Add("Sumsub__SecretKey", builder.Configuration["Sumsub:SecretKey"] ?? "");
        e.EnvironmentVariables.Add("Sumsub__WebhookSecret", builder.Configuration["Sumsub:WebhookSecret"] ?? "");
    })
    .WaitFor(auth);

var web = builder.AddViteApp("web", "../web")
    .WithPnpm()
    .WithEnvironment(e =>
    {
        e.EnvironmentVariables.Add("VITE_API_URL", api.GetEndpoint("http").Url);
        e.EnvironmentVariables.Add("VITE_AUTH_URL", auth.GetEndpoint("http").Url);
    })
    .WithReference(auth)
    .WaitFor(auth)
    .WithHttpEndpoint(targetPort: 4320, isProxied: false);

auth.WithEnvironment(e =>
{
    e.EnvironmentVariables.Add("BETTER_AUTH_URL", auth.GetEndpoint("http").Url);
    e.EnvironmentVariables.Add("AUTH_WEB_ORIGIN", $"{web.GetEndpoint("http").Url},*.devtunnels.ms, *.ngrok-free.app,{defaultMobileScheme}://auth");
})
    .WithHttpEndpoint(targetPort: 4319, isProxied: false);

builder.AddViteApp("marketing", "../marketing")
    .WithPnpm()
    .WithHttpEndpoint(targetPort: 4321, isProxied: false);

var ngrokAuth = builder.AddParameter("ngrok-auth-token", secret: true);
builder.AddNgrok("external")
    .WithLifetime(ContainerLifetime.Persistent)
    .WaitFor(api)
    .WaitFor(auth)
    .WaitFor(web)
    .WithAuthToken(ngrokAuth)
    .WithTunnelEndpoint(api, "http")
    .WithTunnelEndpoint(auth, "http")
    .WithTunnelEndpoint(web, "http");


builder.Build().Run();
