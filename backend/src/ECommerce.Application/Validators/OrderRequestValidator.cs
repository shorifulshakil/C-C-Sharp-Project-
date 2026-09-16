using ECommerce.Application.DTOs.Order;
using FluentValidation;

namespace ECommerce.Application.Validators;

public class OrderRequestValidator : AbstractValidator<OrderRequest>
{
    public OrderRequestValidator()
    {
        RuleFor(x => x.ShippingAddress)
            .NotEmpty().WithMessage("Shipping address is required.");
    }
}
