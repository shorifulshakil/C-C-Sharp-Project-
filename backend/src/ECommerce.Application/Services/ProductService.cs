using AutoMapper;
using ECommerce.Application.DTOs.Product;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class ProductService : IProductService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ProductService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<ProductResponse> CreateAsync(Guid dealerId, ProductRequest request)
    {
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(dealerId)
            ?? throw new KeyNotFoundException("Dealer profile not found.");

        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId)
            ?? throw new KeyNotFoundException("Category not found.");

        var product = new Product
        {
            Id = Guid.NewGuid(),
            Name = request.Name,
            Description = request.Description,
            Price = request.Price,
            StockQuantity = request.StockQuantity,
            Sku = request.Sku,
            CategoryId = request.CategoryId,
            DealerId = dealer.Id,
            ApprovalStatus = ApprovalStatus.Pending,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        if (request.Images != null)
        {
            foreach (var img in request.Images.Select((i, idx) => new { i, idx }))
            {
                product.Images.Add(new ProductImage
                {
                    Id = Guid.NewGuid(),
                    ImageUrl = img.i.ImageUrl,
                    DisplayOrder = img.i.DisplayOrder > 0 ? img.i.DisplayOrder : img.idx,
                    ProductId = product.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        await _unitOfWork.Products.AddAsync(product);
        await _unitOfWork.SaveChangesAsync();

        return MapToResponse(product, dealer, category);
    }

    public async Task<ProductResponse?> GetByIdAsync(Guid id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null) return null;
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(product.DealerId);
        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        return MapToResponse(product, dealer!, category!);
    }

    public async Task<ProductResponse?> GetPublicProductAsync(Guid id)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(id);
        if (product == null || product.ApprovalStatus != ApprovalStatus.Approved) return null;
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(product.DealerId);
        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        return MapToResponse(product, dealer!, category!);
    }

    public async Task<(List<ProductResponse> Items, int Total)> GetPublicProductsAsync(ProductFilter filter)
    {
        var query = _unitOfWork.Products.GetQueryable()
            .Where(p => p.ApprovalStatus == ApprovalStatus.Approved);

        if (filter.CategoryId.HasValue)
            query = query.Where(p => p.CategoryId == filter.CategoryId.Value);

        if (filter.MinPrice.HasValue)
            query = query.Where(p => p.Price >= filter.MinPrice.Value);

        if (filter.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= filter.MaxPrice.Value);

        if (!string.IsNullOrWhiteSpace(filter.Search))
            query = query.Where(p => p.Name.Contains(filter.Search!) || (p.Description != null && p.Description.Contains(filter.Search!)));

        var total = await query.CountAsync();
        
        var items = filter.SortBy switch
        {
            "price_asc" => await query.OrderBy(p => p.Price).Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize).ToListAsync(),
            "price_desc" => await query.OrderByDescending(p => p.Price).Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize).ToListAsync(),
            _ => await query.OrderByDescending(p => p.CreatedAt).Skip((filter.Page - 1) * filter.PageSize).Take(filter.PageSize).ToListAsync()
        };

        // Batch load dealers and categories to avoid N+1
        var dealerIds = items.Select(p => p.DealerId).Distinct().ToList();
        var categoryIds = items.Select(p => p.CategoryId).Distinct().ToList();
        
        var dealers = new Dictionary<Guid, Dealer>();
        var categories = new Dictionary<Guid, Category>();
        
        foreach (var did in dealerIds)
        {
            var d = await _unitOfWork.Dealers.GetByIdAsync(did);
            if (d != null) dealers[did] = d;
        }
        foreach (var cid in categoryIds)
        {
            var c = await _unitOfWork.Categories.GetByIdAsync(cid);
            if (c != null) categories[cid] = c;
        }

        var result = items.Select(p => MapToResponse(p,
            dealers.GetValueOrDefault(p.DealerId)!,
            categories.GetValueOrDefault(p.CategoryId)!)).ToList();

        return (result, total);
    }

    public async Task<(List<ProductResponse> Items, int Total)> GetDealerProductsAsync(Guid dealerId, string? status, int page, int pageSize)
    {
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(dealerId)
            ?? throw new KeyNotFoundException("Dealer profile not found.");

        var query = _unitOfWork.Products.GetQueryable().Where(p => p.DealerId == dealer.Id);

        if (!string.IsNullOrWhiteSpace(status) && Enum.TryParse<ApprovalStatus>(status, true, out var approvalStatus))
        {
            query = query.Where(p => p.ApprovalStatus == approvalStatus);
        }

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(p => p.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var result = new List<ProductResponse>();
        foreach (var p in items)
        {
            var category = await _unitOfWork.Categories.GetByIdAsync(p.CategoryId);
            result.Add(MapToResponse(p, dealer, category!));
        }

        return (result, total);
    }

    public async Task<(List<ProductResponse> Items, int Total)> GetPendingProductsAsync(int page, int pageSize)
    {
        var query = _unitOfWork.Products.GetQueryable()
            .Where(p => p.ApprovalStatus == ApprovalStatus.Pending);

        var total = await query.CountAsync();
        var items = await query.OrderByDescending(p => p.CreatedAt).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        var result = new List<ProductResponse>();
        foreach (var p in items)
        {
            var dealer = await _unitOfWork.Dealers.GetByIdAsync(p.DealerId);
            var category = await _unitOfWork.Categories.GetByIdAsync(p.CategoryId);
            result.Add(MapToResponse(p, dealer!, category!));
        }

        return (result, total);
    }

    public async Task<ProductResponse> UpdateAsync(Guid dealerId, Guid productId, ProductRequest request)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId)
            ?? throw new KeyNotFoundException("Product not found.");

        if (product.DealerId != dealerId)
            throw new UnauthorizedAccessException("You do not own this product.");

        var category = await _unitOfWork.Categories.GetByIdAsync(request.CategoryId)
            ?? throw new KeyNotFoundException("Category not found.");

        product.Name = request.Name;
        product.Description = request.Description;
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.Sku = request.Sku;
        product.CategoryId = request.CategoryId;
        product.UpdatedAt = DateTime.UtcNow;

        if (request.Images != null)
        {
            product.Images.Clear();
            foreach (var img in request.Images.Select((i, idx) => new { i, idx }))
            {
                product.Images.Add(new ProductImage
                {
                    Id = Guid.NewGuid(),
                    ImageUrl = img.i.ImageUrl,
                    DisplayOrder = img.i.DisplayOrder > 0 ? img.i.DisplayOrder : img.idx,
                    ProductId = product.Id,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                });
            }
        }

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        var dealer = await _unitOfWork.Dealers.GetByIdAsync(product.DealerId);
        return MapToResponse(product, dealer!, category);
    }

    public async Task DeleteAsync(Guid dealerId, Guid productId)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId)
            ?? throw new KeyNotFoundException("Product not found.");

        if (dealerId != Guid.Empty && product.DealerId != dealerId)
            throw new UnauthorizedAccessException("You do not own this product.");

        await _unitOfWork.Products.DeleteAsync(product);
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task<ProductResponse> ApproveAsync(Guid productId)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId)
            ?? throw new KeyNotFoundException("Product not found.");

        product.ApprovalStatus = ApprovalStatus.Approved;
        product.PublishedAt = DateTime.UtcNow;
        product.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        var dealer = await _unitOfWork.Dealers.GetByIdAsync(product.DealerId);
        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        return MapToResponse(product, dealer!, category!);
    }

    public async Task<ProductResponse> RejectAsync(Guid productId, string rejectionReason)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId)
            ?? throw new KeyNotFoundException("Product not found.");

        product.ApprovalStatus = ApprovalStatus.Rejected;
        product.RejectionReason = rejectionReason;
        product.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        var dealer = await _unitOfWork.Dealers.GetByIdAsync(product.DealerId);
        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        return MapToResponse(product, dealer!, category!);
    }

    public async Task<ProductResponse> UnpublishAsync(Guid productId)
    {
        var product = await _unitOfWork.Products.GetByIdAsync(productId)
            ?? throw new KeyNotFoundException("Product not found.");

        product.ApprovalStatus = ApprovalStatus.Unpublished;
        product.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Products.UpdateAsync(product);
        await _unitOfWork.SaveChangesAsync();

        var dealer = await _unitOfWork.Dealers.GetByIdAsync(product.DealerId);
        var category = await _unitOfWork.Categories.GetByIdAsync(product.CategoryId);
        return MapToResponse(product, dealer!, category!);
    }

    private ProductResponse MapToResponse(Product p, Dealer dealer, Category category)
    {
        return new ProductResponse
        {
            Id = p.Id,
            Name = p.Name,
            Description = p.Description,
            Price = p.Price,
            StockQuantity = p.StockQuantity,
            Sku = p.Sku,
            ApprovalStatus = p.ApprovalStatus.ToString(),
            RejectionReason = p.RejectionReason,
            PublishedAt = p.PublishedAt,
            DealerId = p.DealerId,
            DealerName = dealer?.ShopName ?? string.Empty,
            DealerOwnerName = dealer?.FullName,
            DealerAddress = dealer?.Address,
            CategoryId = p.CategoryId,
            CategoryName = category?.Name ?? string.Empty,
            Images = p.Images.Select(i => new ProductImageDto { ImageUrl = i.ImageUrl, DisplayOrder = i.DisplayOrder }).ToList(),
            CreatedAt = p.CreatedAt
        };
    }
}
