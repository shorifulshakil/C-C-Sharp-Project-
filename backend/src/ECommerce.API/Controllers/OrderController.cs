using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ECommerce.Application.Interfaces;
using ECommerce.Application.DTOs.Order;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/orders")]
[Authorize]
public class OrderController : ControllerBase
{
    private readonly IOrderService _orderService;

    public OrderController(IOrderService orderService)
    {
        _orderService = orderService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid token");
        return userId;
    }

    [HttpPost]
    [Authorize(Roles = "Customer")]
    public async Task<IActionResult> CreateOrder([FromBody] OrderRequest request)
    {
        var customerId = GetUserId();
        var order = await _orderService.CreateAsync(customerId, request);
        return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders()
    {
        var userId = GetUserId();
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;

        if (userRole == "Customer")
        {
            var orders = await _orderService.GetCustomerOrdersAsync(userId);
            return Ok(new { items = orders, total = orders.Count, page = 1, pageSize = orders.Count });
        }

        return BadRequest(new { message = "Invalid role for this endpoint" });
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var order = await _orderService.GetByIdAsync(id);
        if (order == null) return NotFound();
        return Ok(order);
    }

    [HttpPut("{id}/status")]
    [Authorize(Roles = "Admin,Dealer")]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var userId = GetUserId();
        var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
        Guid? dealerId = userRole == "Dealer" ? userId : null;

        var order = await _orderService.UpdateStatusAsync(id, request.Status, dealerId);
        return Ok(order);
    }
}
