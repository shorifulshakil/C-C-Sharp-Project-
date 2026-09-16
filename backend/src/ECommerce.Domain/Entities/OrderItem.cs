using System.ComponentModel.DataAnnotations;

namespace ECommerce.Domain.Entities;

public class OrderItem : BaseEntity
{
    [Required]
    public Guid OrderId { get; set; }
    public Order Order { get; set; } = null!;

    [Required]
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [Required]
    public Guid DealerId { get; set; }
    public Dealer Dealer { get; set; } = null!;

    public int Quantity { get; set; }

    public decimal UnitPriceAtPurchase { get; set; }

    public decimal Subtotal { get; set; }
}
