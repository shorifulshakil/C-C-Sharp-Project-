using ECommerce.Application.DTOs.Cart;

namespace ECommerce.Application.Interfaces;

public interface ICartService
{
    Task<CartResponse> GetCartAsync(Guid customerId);
    Task<CartItemResponse> AddItemAsync(Guid customerId, CartItemRequest request);
    Task<CartItemResponse> UpdateItemAsync(Guid customerId, Guid cartItemId, int quantity);
    Task DeleteItemAsync(Guid customerId, Guid cartItemId);
    Task ClearCartAsync(Guid customerId);
}
