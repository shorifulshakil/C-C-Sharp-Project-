using AutoMapper;
using ECommerce.Application.DTOs.Category;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;

namespace ECommerce.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public CategoryService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<List<CategoryResponse>> GetAllAsync()
    {
        var categories = _unitOfWork.Categories.GetQueryable().OrderBy(c => c.Name).ToList();
        var result = new List<CategoryResponse>();
        foreach (var c in categories)
        {
            result.Add(new CategoryResponse
            {
                Id = c.Id,
                Name = c.Name,
                Description = c.Description,
                ParentCategoryId = c.ParentCategoryId,
                ParentCategoryName = c.ParentCategory?.Name
            });
        }
        return result;
    }

    public async Task<CategoryResponse> CreateAsync(CategoryRequest request)
    {
        var existing = _unitOfWork.Categories.GetQueryable().FirstOrDefault(c => c.Name == request.Name);
        if (existing != null)
            throw new InvalidOperationException("Category already exists.");

        var category = new Category
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            ParentCategoryId = request.ParentCategoryId,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        await _unitOfWork.Categories.AddAsync(category);
        await _unitOfWork.SaveChangesAsync();

        string? parentName = null;
        if (request.ParentCategoryId.HasValue)
        {
            var parent = await _unitOfWork.Categories.GetByIdAsync(request.ParentCategoryId.Value);
            parentName = parent?.Name;
        }

        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ParentCategoryId = category.ParentCategoryId,
            ParentCategoryName = parentName
        };
    }

    public async Task<CategoryResponse?> UpdateAsync(Guid id, CategoryRequest request)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id);
        if (category == null) return null;

        category.Name = request.Name;
        category.Description = request.Description;
        category.ParentCategoryId = request.ParentCategoryId;
        category.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Categories.UpdateAsync(category);
        await _unitOfWork.SaveChangesAsync();

        string? parentName = null;
        if (request.ParentCategoryId.HasValue)
        {
            var parent = await _unitOfWork.Categories.GetByIdAsync(request.ParentCategoryId.Value);
            parentName = parent?.Name;
        }

        return new CategoryResponse
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            ParentCategoryId = category.ParentCategoryId,
            ParentCategoryName = parentName
        };
    }

    public async Task DeleteAsync(Guid id)
    {
        var category = await _unitOfWork.Categories.GetByIdAsync(id)
            ?? throw new KeyNotFoundException("Category not found.");

        var hasProducts = _unitOfWork.Products.GetQueryable().Any(p => p.CategoryId == id);
        if (hasProducts)
            throw new InvalidOperationException("Cannot delete category with existing products.");

        await _unitOfWork.Categories.DeleteAsync(category);
        await _unitOfWork.SaveChangesAsync();
    }
}
