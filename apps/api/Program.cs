using Api.Infrastructure.Database;
using Api.Features;
using Api.Features.Notarization;
using Api.Infrastructure.Cryptography;
using Api.Infrastructure.Storage;
using Api.Infrastructure.Auth;
using Api.Shared.Middleware;
using Api.Shared.Security;
using FluentValidation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

using System.Threading.RateLimiting;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.AspNetCore.HttpOverrides;
using MimeDetective;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.
builder.AddNpgsqlDbContext<AppDbContext>("appdb");
builder.AddRedisClient("redis");

// A03:2021-Injection - Global HTML Sanitization
builder.Services.AddSingleton<IHtmlSanitizerService, HtmlSanitizerService>();

// File signature validation to prevent MIME type poisoning
builder.Services.AddSingleton<IContentInspector>(s => 
    new ContentInspectorBuilder
    {
        Definitions = MimeDetective.Definitions.DefaultDefinitions.All()
    }.Build());

builder.Services.ConfigureHttpJsonOptions(options =>
{
    var sanitizer = new HtmlSanitizerService(); // Service provider not available yet
    options.SerializerOptions.Converters.Add(new SanitizedStringConverter(sanitizer));
});

// A01:2021-Broken Access Control - Ensure we get real IPs and protocols behind proxies (Cloudflare)
builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    // Cloudflare specific: we trust their IPs usually, but for simplicity we clear known networks/proxies
    // In production, you should restrict this to Cloudflare's IP ranges.
    options.KnownIPNetworks.Clear();
    options.KnownProxies.Clear();
});

if (!string.IsNullOrEmpty(builder.Configuration["Storage:R2:AccessKey"]))
{
    builder.Services.AddScoped<IFileStorage, CloudflareR2Storage>();
}
else
{
    builder.Services.AddScoped<IFileStorage, LocalFileStorage>();
}

builder.Services.AddScoped<INotarizationService, NotarizationService>();
builder.Services.AddScoped<ICryptographyService, CryptographyService>();
builder.Services.AddSignalR();
builder.Services.AddTransient<ExceptionHandlingMiddleware>();
builder.Services.AddValidatorsFromAssembly(typeof(Program).Assembly);
builder.Services.AddHttpClient<BetterAuthJwksProvider>();

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services.AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<BetterAuthJwksProvider>((options, jwksProvider) =>
    {
        var authority = builder.Configuration["Auth:Authority"]?.TrimEnd('/');

        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = !string.IsNullOrWhiteSpace(authority),
            ValidateAudience = !string.IsNullOrWhiteSpace(authority),
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = authority,
            ValidAudience = authority,
            ClockSkew = TimeSpan.FromMinutes(1),
            IssuerSigningKeyResolver = (token, securityToken, kid, validationParameters) =>
                string.IsNullOrWhiteSpace(authority)
                    ? []
                    : jwksProvider.GetSigningKeysAsync(authority, kid, CancellationToken.None)
                        .GetAwaiter()
                        .GetResult(),
        };
    });

builder.Services.AddAuthorization();

// A05:2021-Security Misconfiguration - Limit request body size to prevent DoS
builder.WebHost.ConfigureKestrel(serverOptions =>
{
    serverOptions.Limits.MaxRequestBodySize = 10 * 1024 * 1024; // 10MB
});

// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

builder.Services.AddHttpLogging(logging =>
{
    logging.LoggingFields = Microsoft.AspNetCore.HttpLogging.HttpLoggingFields.All;
});

builder.Services.AddRateLimiter(options =>
{
    options.AddFixedWindowLimiter("fixed", opt =>
    {
        opt.PermitLimit = 100;
        opt.Window = TimeSpan.FromMinutes(1);
        opt.QueueProcessingOrder = QueueProcessingOrder.OldestFirst;
        opt.QueueLimit = 2;
    });
});

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        // A01:2021-Broken Access Control - Tighten CORS
        var allowedOrigins = builder.Configuration.GetSection("Auth:AllowedOrigins").Get<string[]>() ?? [];
        if (allowedOrigins.Length > 0)
        {
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials();
        }
        else
        {
            // Fallback for development, but ideally always specified
            policy.AllowAnyOrigin()
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        }
    });
});

var enforceHttps = builder.Configuration.GetValue<bool>("Auth:EnforceHttps", false);

// A02:2021-Cryptographic Failures - Enforce HSTS in non-development
if (!builder.Environment.IsDevelopment() && enforceHttps)
{
    builder.Services.AddHsts(options =>
    {
        options.Preload = true;
        options.IncludeSubDomains = true;
        options.MaxAge = TimeSpan.FromDays(365);
    });
}

var app = builder.Build();

// Essential for correct protocol detection when behind Cloudflare
app.UseForwardedHeaders();

// A09:2021-Security Logging and Monitoring Failures - Outermost to catch/log everything
app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseHttpLogging();

// A02:2021-Cryptographic Failures - Enforce HTTPS early
if (!app.Environment.IsDevelopment() && enforceHttps)
{
    app.UseHsts();
    app.UseHttpsRedirection();
}

// A05:2021-Security Misconfiguration - Add security headers
app.UseSecurityHeaders();

// A01:2021-Broken Access Control - Handle CORS before auth
app.UseCors();

// A04:2021-Insecure Design - Rate limiting
app.UseRateLimiter();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "API is running.");

app.MapFeatures();

await app.ApplyMigrationsAsync();

await app.RunAsync();
