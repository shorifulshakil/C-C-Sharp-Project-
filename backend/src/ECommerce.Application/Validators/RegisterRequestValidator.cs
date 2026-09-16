using ECommerce.Application.DTOs.Auth;
using FluentValidation;

namespace ECommerce.Application.Validators;

public class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    public RegisterRequestValidator()
    {
        RuleFor(x => x.Email)
            .NotEmpty().WithMessage("Email is required.")
            .EmailAddress().WithMessage("Invalid email format.")
            .MaximumLength(256);

        RuleFor(x => x.Password)
            .NotEmpty().WithMessage("Password is required.")
            .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

        RuleFor(x => x.FullName)
            .NotEmpty().WithMessage("Full name is required.")
            .MaximumLength(256);

        RuleFor(x => x.Phone)
            .MaximumLength(32).When(x => !string.IsNullOrEmpty(x.Phone));

        RuleFor(x => x.Role)
            .NotEmpty().WithMessage("Role is required.")
            .Must(role => role == "Admin" || role == "Dealer" || role == "Customer")
            .WithMessage("Role must be Admin, Dealer, or Customer.");

        RuleFor(x => x.ShopName)
            .NotEmpty().WithMessage("Shop name is required when registering as a Dealer.")
            .MaximumLength(256).WithMessage("Shop name cannot exceed 256 characters.")
            .When(x => string.Equals(x.Role, "Dealer", System.StringComparison.OrdinalIgnoreCase));
    }
}

