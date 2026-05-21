using System.Text.Json;
using StackExchange.Redis;

namespace Api.Infrastructure.Redis;

public static class RedisExtensions
{
    public static async Task SetAsync<T>(this IDatabase db, string key, T value, TimeSpan? expiry = null)
    {
        var json = JsonSerializer.Serialize(value);
        await db.StringSetAsync(key, json, expiry, false);
    }

    public static async Task<T?> GetAsync<T>(this IDatabase db, string key)
    {
        var value = await db.StringGetAsync(key);
        if (value.IsNullOrEmpty)
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>((string)value!);
    }

    public static async Task RemoveAsync(this IDatabase db, string key)
    {
        await db.KeyDeleteAsync(key);
    }
}
