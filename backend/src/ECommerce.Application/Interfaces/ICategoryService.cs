using ECommerce.Application.DTOs.Category;

namespace ECommerce.Application.Interfaces;

public interface ICategoryService
{
    Task<List<CategoryResponse>> GetAllAsync();
    Task<CategoryResponse> CreateAsync(CategoryRequest request);
    Task<CategoryResponse?> UpdateAsync(Guid id, CategoryRequest request);
    Task DeleteAsync(Guid id);
}
