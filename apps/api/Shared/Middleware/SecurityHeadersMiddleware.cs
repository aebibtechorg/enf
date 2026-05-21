namespace Api.Shared.Middleware;

public sealed class SecurityHeadersMiddleware(RequestDelegate next)
{
    public async Task InvokeAsync(HttpContext context)
    {
        // A05:2021-Security Misconfiguration
        
        // Prevent clickjacking
        context.Response.Headers.Append("X-Frame-Options", "DENY");
        
        // Prevent MIME sniffing
        context.Response.Headers.Append("X-Content-Type-Options", "nosniff");
        
        // Control how much referrer information is passed
        context.Response.Headers.Append("Referrer-Policy", "strict-origin-when-cross-origin");
        
        // Content Security Policy - Minimal for an API
        // default-src 'none' means nothing is allowed by default
        // frame-ancestors 'none' prevents the site from being embedded in an iframe
        context.Response.Headers.Append("Content-Security-Policy", "default-src 'none'; frame-ancestors 'none'; sandbox");

        // A02:2021-Cryptographic Failures
        // Ensure HSTS is set if it's an HTTPS request (usually handled by app.UseHsts() but good to have here as well or instead)
        // Strictly speaking, app.UseHsts() is better as it has more configuration options.

        // Permissions Policy - Restrict access to browser features
        context.Response.Headers.Append("Permissions-Policy", "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()");

        // Remove Server header for security through obscurity (optional but recommended)
        context.Response.Headers.Remove("Server");

        await next(context);
    }
}

public static class SecurityHeadersMiddlewareExtensions
{
    public static IApplicationBuilder UseSecurityHeaders(this IApplicationBuilder app)
    {
        return app.UseMiddleware<SecurityHeadersMiddleware>();
    }
}
