using ECommerce.Application.DTOs.Product;

namespace ECommerce.Application.Interfaces;

public interface IProductService
{
    Task<ProductResponse> CreateAsync(Guid dealerId, ProductRequest request);
    Task<ProductResponse?> GetByIdAsync(Guid id);
    Task<(List<ProductResponse> Items, int Total)> GetPublicProductsAsync(ProductFilter filter);
    Task<(List<ProductResponse> Items, int Total)> GetDealerProductsAsync(Guid dealerId, string? status, int page, int pageSize);
    Task<ProductResponse> UpdateAsync(Guid dealerId, Guid productId, ProductRequest request);
    Task DeleteAsync(Guid dealerId, Guid productId);
    Task<ProductResponse> ApproveAsync(Guid productId);
    Task<ProductResponse> RejectAsync(Guid productId, string rejectionReason);
    Task<ProductResponse> UnpublishAsync(Guid productId);
    Task<(List<ProductResponse> Items, int Total)> GetPendingProductsAsync(int page, int pageSize);
    Task<ProductResponse?> GetPublicProductAsync(Guid id);
}
