using System.ComponentModel.DataAnnotations;

namespace ECommerce.Domain.Entities;

public class CartItem : BaseEntity
{
    [Required]
    public Guid CartId { get; set; }
    public Cart Cart { get; set; } = null!;

    [Required]
    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    public decimal PriceAtAdd { get; set; }
}
