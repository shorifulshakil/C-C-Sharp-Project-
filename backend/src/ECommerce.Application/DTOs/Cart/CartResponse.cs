namespace ECommerce.Application.DTOs.Cart;

public class CartResponse
{
    public Guid Id { get; set; }
    public Guid CustomerId { get; set; }
    public List<CartItemResponse> Items { get; set; } = new();
    public decimal TotalAmount { get; set; }
    public DateTime CreatedAt { get; set; }
}
