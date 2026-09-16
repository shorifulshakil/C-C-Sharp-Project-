using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ECommerce.Application.Interfaces;
using ECommerce.Application.DTOs.Cart;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/cart")]
[Authorize(Roles = "Customer")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;

    public CartController(ICartService cartService)
    {
        _cartService = cartService;
    }

    private Guid GetCustomerId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid token");
        return userId;
    }

    [HttpGet]
    public async Task<IActionResult> GetCart()
    {
        var customerId = GetCustomerId();
        var cart = await _cartService.GetCartAsync(customerId);
        return Ok(cart);
    }

    [HttpPost("items")]
    public async Task<IActionResult> AddItem([FromBody] CartItemRequest request)
    {
        var customerId = GetCustomerId();
        var item = await _cartService.AddItemAsync(customerId, request);
        return Ok(item);
    }

    [HttpPut("items/{id}")]
    public async Task<IActionResult> UpdateItem(Guid id, [FromBody] CartItemQuantityRequest request)
    {
        var customerId = GetCustomerId();
        var item = await _cartService.UpdateItemAsync(customerId, id, request.Quantity);
        return Ok(item);
    }

    [HttpDelete("items/{id}")]
    public async Task<IActionResult> DeleteItem(Guid id)
    {
        var customerId = GetCustomerId();
        await _cartService.DeleteItemAsync(customerId, id);
        return NoContent();
    }
}
