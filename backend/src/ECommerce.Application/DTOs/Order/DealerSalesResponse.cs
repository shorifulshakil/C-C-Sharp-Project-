namespace ECommerce.Application.DTOs.Order;

public class DealerSalesItem
{
    public Guid ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public string? ProductImageUrl { get; set; }
    public decimal UnitPrice { get; set; }
    public int TotalQuantitySold { get; set; }
    public decimal TotalRevenue { get; set; }
    public List<DealerSalesCustomer> Customers { get; set; } = new();
}

public class DealerSalesCustomer
{
    public Guid CustomerId { get; set; }
    public string CustomerName { get; set; } = string.Empty;
    public string CustomerEmail { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
    public DateTime OrderDate { get; set; }
}

public class DealerSalesResponse
{
    public List<DealerSalesItem> Items { get; set; } = new();
    public int TotalOrders { get; set; }
    public int TotalProductsSold { get; set; }
    public decimal TotalRevenue { get; set; }
}
