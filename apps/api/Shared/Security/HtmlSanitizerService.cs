using Ganss.Xss;

namespace Api.Shared.Security;

public interface IHtmlSanitizerService
{
    string Sanitize(string input);
}

public class HtmlSanitizerService : IHtmlSanitizerService
{
    private readonly HtmlSanitizer _sanitizer;

    public HtmlSanitizerService()
    {
        _sanitizer = new HtmlSanitizer();
        // Customize the sanitizer here if needed (e.g., allowed tags, attributes)
    }

    public string Sanitize(string input)
    {
        if (string.IsNullOrWhiteSpace(input)) return input;
        return _sanitizer.Sanitize(input);
    }
}
