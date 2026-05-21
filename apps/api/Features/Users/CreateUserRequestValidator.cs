using Contracts;
using FluentValidation;
using Api.Shared.Security;

namespace Api.Features.Users;

public class CreateUserRequestValidator : AbstractValidator<CreateUserRequest>
{
    public CreateUserRequestValidator(IHtmlSanitizerService sanitizer)
    {
        RuleFor(x => x.Email)
            .NotEmpty()
            .EmailAddress()
            .MaximumLength(255);

        RuleFor(x => x.FullName)
            .NotEmpty()
            .MaximumLength(100)
            .SanitizeHtml(sanitizer);
    }
}
