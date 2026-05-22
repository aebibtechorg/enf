using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using System.Net.Http.Json;

namespace Api.Infrastructure.Sumsub;

public interface ISumsubService
{
    Task<string> GetAccessTokenAsync(string userId, string levelName, CancellationToken ct = default);
    bool VerifyWebhookSignature(string signature, byte[] bodyBytes);
}

public class SumsubService : ISumsubService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<SumsubService> _logger;

    public SumsubService(HttpClient httpClient, IConfiguration configuration, ILogger<SumsubService> logger)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> GetAccessTokenAsync(string userId, string levelName, CancellationToken ct = default)
    {
        var appToken = _configuration["Sumsub:AppToken"];
        var secretKey = _configuration["Sumsub:SecretKey"];

        if (string.IsNullOrEmpty(appToken) || string.IsNullOrEmpty(secretKey))
        {
            throw new InvalidOperationException("Sumsub configuration is missing. Ensure Sumsub:AppToken and Sumsub:SecretKey are set.");
        }

        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString();
        var method = "POST";
        var path = $"/resources/accessTokens?userId={userId}&levelName={levelName}";
        
        var request = new HttpRequestMessage(new HttpMethod(method), $"https://api.sumsub.com{path}");
        
        var signature = GenerateSignature(timestamp, method, path, null, secretKey);
        
        request.Headers.Add("X-App-Token", appToken);
        request.Headers.Add("X-App-Access-Sig", signature);
        request.Headers.Add("X-App-Access-Ts", timestamp);

        var response = await _httpClient.SendAsync(request, ct);
        if (!response.IsSuccessStatusCode)
        {
            var errorBody = await response.Content.ReadAsStringAsync(ct);
            _logger.LogError("Sumsub Token API failed: {StatusCode} - {ErrorBody}", response.StatusCode, errorBody);
            throw new Exception($"Sumsub Token API failed: {response.StatusCode}");
        }

        var json = await response.Content.ReadFromJsonAsync<JsonElement>(cancellationToken: ct);
        return json.GetProperty("token").GetString() ?? throw new Exception("Token not found in response");
    }

    public bool VerifyWebhookSignature(string signature, byte[] bodyBytes)
    {
        var secretKey = _configuration["Sumsub:WebhookSecret"] ?? _configuration["Sumsub:SecretKey"];
        if (string.IsNullOrEmpty(secretKey)) return false;

        var keyBytes = Encoding.UTF8.GetBytes(secretKey);

        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(bodyBytes);
        var calculatedSignature = BitConverter.ToString(hash).Replace("-", "").ToLower();

        return string.Equals(signature, calculatedSignature, StringComparison.OrdinalIgnoreCase);
    }

    private string GenerateSignature(string timestamp, string method, string path, string? body, string secretKey)
    {
        var data = timestamp + method.ToUpper() + path + (body ?? "");
        var keyBytes = Encoding.UTF8.GetBytes(secretKey);
        var dataBytes = Encoding.UTF8.GetBytes(data);

        using var hmac = new HMACSHA256(keyBytes);
        var hash = hmac.ComputeHash(dataBytes);
        return BitConverter.ToString(hash).Replace("-", "").ToLower();
    }
}
