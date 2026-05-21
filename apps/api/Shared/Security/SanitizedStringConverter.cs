using System.Text.Json;
using System.Text.Json.Serialization;
using Api.Shared.Security;

namespace Api.Shared.Security;

public class SanitizedStringConverter(IHtmlSanitizerService sanitizer) : JsonConverter<string>
{
    public override string? Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        var value = reader.GetString();
        return value == null ? null : sanitizer.Sanitize(value);
    }

    public override void Write(Utf8JsonWriter writer, string value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(value);
    }
}
