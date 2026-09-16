using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using ECommerce.Application.Interfaces;
using ECommerce.Application.DTOs.Dealer;
using ECommerce.Application.DTOs.Product;
using ECommerce.Application.DTOs.Order;

namespace ECommerce.API.Controllers;

[ApiController]
[Route("api/dealers")]
[Authorize(Roles = "Dealer")]
public class DealerController : ControllerBase
{
    private readonly IDealerService _dealerService;
    private readonly IProductService _productService;
    private readonly IOrderService _orderService;
    private readonly IAdminService _adminService;

    public DealerController(IDealerService dealerService, IProductService productService, IOrderService orderService, IAdminService adminService)
    {
        _dealerService = dealerService;
        _productService = productService;
        _orderService = orderService;
        _adminService = adminService;
    }

    private Guid GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !Guid.TryParse(userIdClaim, out var userId))
            throw new UnauthorizedAccessException("Invalid token");
        return userId;
    }

    [HttpGet("profile")]
    public async Task<IActionResult> GetProfile()
    {
        var userId = GetUserId();
        var profile = await _dealerService.GetProfileAsync(userId);
        return Ok(profile);
    }

    [HttpPut("profile")]
    public async Task<IActionResult> UpdateProfile([FromBody] DealerProfileRequest request)
    {
        var userId = GetUserId();
        var profile = await _dealerService.UpdateProfileAsync(userId, request);
        return Ok(profile);
    }

    [HttpGet("products")]
    public async Task<IActionResult> GetProducts([FromQuery] string? status, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        var result = await _productService.GetDealerProductsAsync(userId, status, page, pageSize);
        return Ok(new { items = result.Items, total = result.Total, page, pageSize });
    }

    [HttpPost("products")]
    public async Task<IActionResult> CreateProduct([FromBody] ProductRequest request)
    {
        var userId = GetUserId();
        var product = await _productService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetProducts), new { id = product.Id }, product);
    }

    [HttpPut("products/{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] ProductRequest request)
    {
        var userId = GetUserId();
        var product = await _productService.UpdateAsync(userId, id, request);
        return Ok(product);
    }

    [HttpDelete("products/{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var userId = GetUserId();
        await _productService.DeleteAsync(userId, id);
        return NoContent();
    }

    [HttpGet("orders")]
    public async Task<IActionResult> GetOrders([FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var userId = GetUserId();
        var orders = await _orderService.GetDealerOrdersAsync(userId);
        return Ok(new { items = orders, total = orders.Count, page, pageSize });
    }

    [HttpPut("orders/{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateOrderStatusRequest request)
    {
        var userId = GetUserId();
        var order = await _orderService.UpdateStatusAsync(id, request.Status, userId);
        return Ok(order);
    }

    [HttpGet("products/{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var userId = GetUserId();
        var product = await _productService.GetByIdAsync(id);
        if (product == null) return NotFound();
        if (product.DealerId != userId) return Forbid();
        return Ok(product);
    }

    [HttpGet("sales")]
    public async Task<IActionResult> GetSales()
    {
        var userId = GetUserId();
        var sales = await _orderService.GetDealerSalesAsync(userId);
        return Ok(sales);
    }

    [HttpGet("customers")]
    public async Task<IActionResult> GetCustomers()
    {
        var userId = GetUserId();
        var customers = await _adminService.GetDealerCustomersAsync(userId);
        return Ok(new { items = customers, total = customers.Count });
    }
}
