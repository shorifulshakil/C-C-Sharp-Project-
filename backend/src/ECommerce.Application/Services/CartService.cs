using ECommerce.Application.DTOs.Cart;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class CartService : ICartService
{
    private readonly IUnitOfWork _unitOfWork;

    public CartService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<CartResponse> GetCartAsync(Guid customerId)
    {
        var cart = await GetOrCreateCartAsync(customerId);
        return await MapCartAsync(cart);
    }

    public async Task<CartItemResponse> AddItemAsync(Guid customerId, CartItemRequest request)
    {
        var cart = await GetOrCreateCartAsync(customerId);
        var product = await _unitOfWork.Products.GetByIdAsync(request.ProductId)
            ?? throw new KeyNotFoundException("Product not found.");

        if (product.ApprovalStatus != ApprovalStatus.Approved)
            throw new InvalidOperationException("Product is not available.");

        if (product.StockQuantity < request.Quantity)
            throw new InvalidOperationException("Insufficient stock.");

        var existing = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
        if (existing != null)
        {
            existing.Quantity += request.Quantity;
            existing.PriceAtAdd = product.Price;
            await _unitOfWork.CartItems.UpdateAsync(existing);
        }
        else
        {
            var item = new CartItem
            {
                Id = Guid.NewGuid(),
                CartId = cart.Id,
                ProductId = request.ProductId,
                Quantity = request.Quantity,
                PriceAtAdd = product.Price
            };
            await _unitOfWork.CartItems.AddAsync(item);
            cart.Items.Add(item);
        }

        cart.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        var addedItem = cart.Items.Last(i => i.ProductId == request.ProductId);
        var prod = await _unitOfWork.Products.GetByIdAsync(addedItem.ProductId);
        return MapCartItem(addedItem, prod);
    }

    public async Task<CartItemResponse> UpdateItemAsync(Guid customerId, Guid cartItemId, int quantity)
    {
        var cart = await GetOrCreateCartAsync(customerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId)
            ?? throw new KeyNotFoundException("Cart item not found.");

        if (quantity <= 0)
            throw new InvalidOperationException("Quantity must be greater than zero.");

        var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId)
            ?? throw new KeyNotFoundException("Product not found.");

        if (product.StockQuantity < quantity)
            throw new InvalidOperationException("Insufficient stock.");

        item.Quantity = quantity;
        item.PriceAtAdd = product.Price;
        await _unitOfWork.CartItems.UpdateAsync(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();

        return MapCartItem(item, product);
    }

    public async Task DeleteItemAsync(Guid customerId, Guid cartItemId)
    {
        var cart = await GetOrCreateCartAsync(customerId);
        var item = cart.Items.FirstOrDefault(i => i.Id == cartItemId)
            ?? throw new KeyNotFoundException("Cart item not found.");

        await _unitOfWork.CartItems.DeleteAsync(item);
        cart.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
    }

    public async Task ClearCartAsync(Guid customerId)
    {
        var cart = await GetOrCreateCartAsync(customerId);
        foreach (var item in cart.Items.ToList())
        {
            await _unitOfWork.CartItems.DeleteAsync(item);
        }
        cart.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.SaveChangesAsync();
    }

    private async Task<Cart> GetOrCreateCartAsync(Guid customerId)
    {
        var cart = await _unitOfWork.Carts.GetQueryable()
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);

        if (cart == null)
        {
            cart = new Cart
            {
                Id = Guid.NewGuid(),
                CustomerId = customerId,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            await _unitOfWork.Carts.AddAsync(cart);
            await _unitOfWork.SaveChangesAsync();
        }
        return cart;
    }

    private async Task<CartResponse> MapCartAsync(Cart cart)
    {
        var items = new List<CartItemResponse>();
        decimal total = 0;
        foreach (var item in cart.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(item.ProductId);
            var subtotal = item.Quantity * item.PriceAtAdd;
            total += subtotal;
            items.Add(new CartItemResponse
            {
                Id = item.Id,
                ProductId = item.ProductId,
                ProductName = product?.Name ?? "Unknown Product",
                ProductImageUrl = product?.Images.FirstOrDefault()?.ImageUrl,
                Quantity = item.Quantity,
                PriceAtAdd = item.PriceAtAdd,
                Subtotal = subtotal
            });
        }
        return new CartResponse
        {
            Id = cart.Id,
            CustomerId = cart.CustomerId,
            Items = items,
            TotalAmount = total,
            CreatedAt = cart.CreatedAt
        };
    }

    private CartItemResponse MapCartItem(CartItem item, Product? product = null)
    {
        return new CartItemResponse
        {
            Id = item.Id,
            ProductId = item.ProductId,
            ProductName = product?.Name ?? "Unknown Product",
            ProductImageUrl = product?.Images.FirstOrDefault()?.ImageUrl,
            Quantity = item.Quantity,
            PriceAtAdd = item.PriceAtAdd,
            Subtotal = item.Quantity * item.PriceAtAdd
        };
    }
}
