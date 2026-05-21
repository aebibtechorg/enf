using FluentValidation;
using Api.Shared.Security;

namespace Api.Shared.Security;

public static class SanitizationExtensions
{
    public static IRuleBuilderOptions<T, string> SanitizeHtml<T>(
        this IRuleBuilder<T, string> ruleBuilder, 
        IHtmlSanitizerService sanitizer)
    {
        return ruleBuilder.Must((_, value, _) => 
        {
            if (string.IsNullOrEmpty(value)) return true;
            
            var sanitized = sanitizer.Sanitize(value);
            // If the sanitized version is different from the original, 
            // it means there was something that got stripped.
            // However, usually we just want to APPLY the sanitization.
            // FluentValidation is for validation, not transformation.
            // For transformation, we might need a different approach or 
            // just use the sanitizer in the endpoint/logic.
            
            // But if the user wants to ENSURE it's clean, we can validate it:
            return value == sanitized;
        }).WithMessage("{PropertyName} contains potentially unsafe HTML content.");
    }
}
