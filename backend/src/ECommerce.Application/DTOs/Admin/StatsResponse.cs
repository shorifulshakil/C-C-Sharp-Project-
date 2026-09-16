namespace ECommerce.Application.DTOs.Admin;

public class StatsResponse
{
    public int TotalUsers { get; set; }
    public int TotalDealers { get; set; }
    public int TotalCustomers { get; set; }
    public int TotalProducts { get; set; }
    public int PendingProducts { get; set; }
    public int ApprovedProducts { get; set; }
    public int RejectedProducts { get; set; }
    public int TotalOrders { get; set; }
    public decimal TotalRevenue { get; set; }
}
