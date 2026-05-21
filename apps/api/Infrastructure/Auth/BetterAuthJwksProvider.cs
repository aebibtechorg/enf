using System.Collections.Concurrent;
using Microsoft.IdentityModel.Tokens;

namespace Api.Infrastructure.Auth;

public sealed class BetterAuthJwksProvider(HttpClient httpClient)
{
    private readonly ConcurrentDictionary<string, CachedKeySet> _cache = new();

    public async Task<IEnumerable<SecurityKey>> GetSigningKeysAsync(string authority, string? keyId, CancellationToken cancellationToken)
    {
        var jwksUrl = $"{authority.TrimEnd('/')}/api/auth/jwks";
        var cached = await GetOrRefreshAsync(jwksUrl, cancellationToken);

        if (string.IsNullOrWhiteSpace(keyId))
        {
            return cached.Keys;
        }

        var matching = cached.Keys.Where(key => string.Equals(key.KeyId, keyId, StringComparison.Ordinal)).ToArray();
        return matching.Length > 0 ? matching : cached.Keys;
    }

    private async Task<CachedKeySet> GetOrRefreshAsync(string jwksUrl, CancellationToken cancellationToken)
    {
        if (_cache.TryGetValue(jwksUrl, out var cached) && cached.ExpiresAt > DateTimeOffset.UtcNow)
        {
            return cached;
        }

        using var response = await httpClient.GetAsync(jwksUrl, cancellationToken);
        response.EnsureSuccessStatusCode();

        var payload = await response.Content.ReadAsStringAsync(cancellationToken);
        var refreshed = new CachedKeySet(JsonWebKeySet.Create(payload).GetSigningKeys().ToList(), DateTimeOffset.UtcNow.AddMinutes(10));
        _cache[jwksUrl] = refreshed;
        return refreshed;
    }

    private sealed record CachedKeySet(IReadOnlyList<SecurityKey> Keys, DateTimeOffset ExpiresAt);
}