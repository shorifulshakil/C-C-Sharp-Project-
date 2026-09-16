using ECommerce.Application.DTOs.Order;

namespace ECommerce.Application.Interfaces;

public interface IOrderService
{
    Task<OrderResponse> CreateAsync(Guid customerId, OrderRequest request);
    Task<OrderResponse?> GetByIdAsync(Guid orderId);
    Task<List<OrderResponse>> GetCustomerOrdersAsync(Guid customerId);
    Task<List<OrderResponse>> GetDealerOrdersAsync(Guid dealerId);
    Task<DealerSalesResponse> GetDealerSalesAsync(Guid dealerId);
    Task<OrderResponse> UpdateStatusAsync(Guid orderId, string status, Guid? dealerId = null);
}
