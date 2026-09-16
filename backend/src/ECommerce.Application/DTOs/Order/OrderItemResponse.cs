namespace ECommerce.Application.DTOs.Order;

public class OrderItemResponse
{
    public Guid Id { get; set; }
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public Guid DealerId { get; set; }
    public string DealerName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPriceAtPurchase { get; set; }
    public decimal Subtotal { get; set; }
}
