using ECommerce.Application.DTOs.Order;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class OrderService : IOrderService
{
    private readonly IUnitOfWork _unitOfWork;

    public OrderService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<OrderResponse> CreateAsync(Guid customerId, OrderRequest request)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(customerId)
            ?? throw new KeyNotFoundException("Customer not found.");

        var cart = await _unitOfWork.Carts.GetQueryable()
            .Include(c => c.Items)
            .FirstOrDefaultAsync(c => c.CustomerId == customerId)
            ?? throw new InvalidOperationException("Cart is empty.");

        if (!cart.Items.Any())
            throw new InvalidOperationException("Cart is empty.");

        var orderItems = new List<OrderItem>();
        decimal total = 0;

        foreach (var cartItem in cart.Items)
        {
            var product = await _unitOfWork.Products.GetByIdAsync(cartItem.ProductId)
                ?? throw new KeyNotFoundException($"Product {cartItem.ProductId} not found.");

            if (product.ApprovalStatus != ApprovalStatus.Approved)
                throw new InvalidOperationException($"Product '{product.Name}' is not available.");

            if (product.StockQuantity < cartItem.Quantity)
                throw new InvalidOperationException($"Insufficient stock for '{product.Name}'. Available: {product.StockQuantity}");

            var subtotal = cartItem.Quantity * product.Price;
            total += subtotal;

            orderItems.Add(new OrderItem
            {
                Id = Guid.NewGuid(),
                OrderId = Guid.Empty,
                ProductId = product.Id,
                DealerId = product.DealerId,
                Quantity = cartItem.Quantity,
                UnitPriceAtPurchase = product.Price,
                Subtotal = subtotal
            });

            product.StockQuantity -= cartItem.Quantity;
            product.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Products.UpdateAsync(product);
        }

        var order = new Order
        {
            Id = Guid.NewGuid(),
            CustomerId = customer.Id,
            Status = OrderStatus.Pending,
            TotalAmount = total,
            ShippingAddress = request.ShippingAddress,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        foreach (var item in orderItems)
        {
            item.OrderId = order.Id;
            order.Items.Add(item);
        }

        await _unitOfWork.Orders.AddAsync(order);

        foreach (var item in cart.Items.ToList())
        {
            await _unitOfWork.CartItems.DeleteAsync(item);
        }

        await _unitOfWork.SaveChangesAsync();

        return await MapToResponseAsync(order);
    }

    public async Task<OrderResponse?> GetByIdAsync(Guid orderId)
    {
        var order = await LoadOrderWithIncludes(orderId);
        if (order == null) return null;
        return await MapToResponseAsync(order);
    }

    public async Task<List<OrderResponse>> GetCustomerOrdersAsync(Guid customerId)
    {
        var orders = await _unitOfWork.Orders.GetQueryable()
            .Include(o => o.Items)
            .Where(o => o.CustomerId == customerId)
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return await MapOrdersAsync(orders);
    }

    public async Task<List<OrderResponse>> GetDealerOrdersAsync(Guid dealerId)
    {
        var orderIds = await _unitOfWork.OrderItems.GetQueryable()
            .Where(i => i.DealerId == dealerId)
            .Select(i => i.OrderId)
            .Distinct()
            .ToListAsync();

        var orders = await _unitOfWork.Orders.GetQueryable()
            .Include(o => o.Items)
            .Where(o => orderIds.Contains(o.Id))
            .OrderByDescending(o => o.CreatedAt)
            .ToListAsync();

        return await MapOrdersAsync(orders);
    }

    public async Task<DealerSalesResponse> GetDealerSalesAsync(Guid dealerId)
    {
        var dealerOrderItems = await _unitOfWork.OrderItems.GetQueryable()
            .Where(i => i.DealerId == dealerId)
            .ToListAsync();

        if (!dealerOrderItems.Any())
        {
            return new DealerSalesResponse();
        }

        var orderIds = dealerOrderItems.Select(i => i.OrderId).Distinct().ToList();
        var productIds = dealerOrderItems.Select(i => i.ProductId).Distinct().ToList();
        var customerIds = (await _unitOfWork.Orders.GetQueryable()
            .Where(o => orderIds.Contains(o.Id))
            .Select(o => o.CustomerId)
            .Distinct().ToListAsync());

        var products = (await _unitOfWork.Products.FindAsync(p => productIds.Contains(p.Id)))
            .ToDictionary(p => p.Id);
        var customers = (await _unitOfWork.Customers.FindAsync(c => customerIds.Contains(c.Id)))
            .ToDictionary(c => c.Id);
        var orders = (await _unitOfWork.Orders.FindAsync(o => orderIds.Contains(o.Id)))
            .ToDictionary(o => o.Id);

        var salesByProduct = dealerOrderItems
            .GroupBy(i => i.ProductId)
            .Select(g =>
            {
                products.TryGetValue(g.Key, out var product);
                var customerGroups = g.GroupBy(i => i.OrderId);
                var customerList = new List<DealerSalesCustomer>();

                foreach (var cg in customerGroups)
                {
                    var orderItem = cg.First();
                    orders.TryGetValue(orderItem.OrderId, out var order);
                    if (order != null)
                    {
                        customers.TryGetValue(order.CustomerId, out var customer);
                        customerList.Add(new DealerSalesCustomer
                        {
                            CustomerId = order.CustomerId,
                            CustomerName = customer?.FullName ?? "Unknown",
                            CustomerEmail = customer?.Email ?? "",
                            Quantity = cg.Sum(i => i.Quantity),
                            Subtotal = cg.Sum(i => i.Subtotal),
                            OrderDate = order.CreatedAt
                        });
                    }
                }

                return new DealerSalesItem
                {
                    ProductId = g.Key,
                    ProductName = product?.Name ?? "Unknown Product",
                    ProductImageUrl = product?.Images.FirstOrDefault()?.ImageUrl,
                    UnitPrice = product?.Price ?? 0,
                    TotalQuantitySold = g.Sum(i => i.Quantity),
                    TotalRevenue = g.Sum(i => i.Subtotal),
                    Customers = customerList.OrderByDescending(c => c.OrderDate).ToList()
                };
            })
            .OrderByDescending(s => s.TotalRevenue)
            .ToList();

        return new DealerSalesResponse
        {
            Items = salesByProduct,
            TotalOrders = orderIds.Count,
            TotalProductsSold = salesByProduct.Sum(s => s.TotalQuantitySold),
            TotalRevenue = salesByProduct.Sum(s => s.TotalRevenue)
        };
    }

    public async Task<OrderResponse> UpdateStatusAsync(Guid orderId, string status, Guid? dealerId = null)
    {
        var order = await LoadOrderWithIncludes(orderId)
            ?? throw new KeyNotFoundException("Order not found.");

        if (dealerId.HasValue)
        {
            var isDealerOrder = order.Items.Any(i => i.DealerId == dealerId.Value);
            if (!isDealerOrder)
            {
                throw new UnauthorizedAccessException("Dealer is not authorized to update this order.");
            }
        }

        if (!Enum.TryParse<OrderStatus>(status, true, out var newStatus))
            throw new ArgumentException("Invalid order status.");

        var allowedTransitions = new Dictionary<OrderStatus, OrderStatus[]>
        {
            [OrderStatus.Pending] = new[] { OrderStatus.Confirmed, OrderStatus.Cancelled },
            [OrderStatus.Confirmed] = new[] { OrderStatus.Processing, OrderStatus.Cancelled },
            [OrderStatus.Processing] = new[] { OrderStatus.Shipped, OrderStatus.Cancelled },
            [OrderStatus.Shipped] = new[] { OrderStatus.Delivered },
            [OrderStatus.Delivered] = Array.Empty<OrderStatus>(),
            [OrderStatus.Cancelled] = Array.Empty<OrderStatus>()
        };

        if (!allowedTransitions[order.Status].Contains(newStatus))
            throw new InvalidOperationException($"Cannot transition from {order.Status} to {newStatus}.");

        order.Status = newStatus;
        order.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Orders.UpdateAsync(order);
        await _unitOfWork.SaveChangesAsync();

        return await MapToResponseAsync(order);
    }

    private async Task<Order?> LoadOrderWithIncludes(Guid orderId)
    {
        return await _unitOfWork.Orders.GetQueryable()
            .Include(o => o.Items)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

    private async Task<List<OrderResponse>> MapOrdersAsync(List<Order> orders)
    {
        var productIds = orders.SelectMany(o => o.Items).Select(i => i.ProductId).Distinct().ToList();
        var dealerIds = orders.SelectMany(o => o.Items).Select(i => i.DealerId).Distinct().ToList();

        var products = (await _unitOfWork.Products.FindAsync(p => productIds.Contains(p.Id)))
            .ToDictionary(p => p.Id);
        var dealers = (await _unitOfWork.Dealers.FindAsync(d => dealerIds.Contains(d.Id)))
            .ToDictionary(d => d.Id);
        var customerIds = orders.Select(o => o.CustomerId).Distinct().ToList();
        var customers = (await _unitOfWork.Customers.FindAsync(c => customerIds.Contains(c.Id)))
            .ToDictionary(c => c.Id);

        var result = new List<OrderResponse>();
        foreach (var order in orders)
        {
            customers.TryGetValue(order.CustomerId, out var customer);
            result.Add(new OrderResponse
            {
                Id = order.Id,
                CustomerId = order.CustomerId,
                CustomerName = customer?.FullName ?? "Unknown",
                Status = order.Status.ToString(),
                TotalAmount = order.TotalAmount,
                ShippingAddress = order.ShippingAddress,
                Items = order.Items.Select(i =>
                {
                    products.TryGetValue(i.ProductId, out var product);
                    dealers.TryGetValue(i.DealerId, out var dealer);
                    return new OrderItemResponse
                    {
                        Id = i.Id,
                        ProductId = i.ProductId,
                        ProductName = product?.Name ?? "Unknown Product",
                        ProductImageUrl = product?.Images.FirstOrDefault()?.ImageUrl,
                        DealerId = i.DealerId,
                        DealerName = dealer?.ShopName ?? "Unknown Shop",
                        Quantity = i.Quantity,
                        UnitPriceAtPurchase = i.UnitPriceAtPurchase,
                        Subtotal = i.Subtotal
                    };
                }).ToList(),
                CreatedAt = order.CreatedAt,
                UpdatedAt = order.UpdatedAt
            });
        }
        return result;
    }

    private async Task<OrderResponse> MapToResponseAsync(Order order)
    {
        var customer = await _unitOfWork.Customers.GetByIdAsync(order.CustomerId);

        await _unitOfWork.OrderItems.GetQueryable()
            .Where(i => i.OrderId == order.Id)
            .LoadAsync();

        await _unitOfWork.Products.GetQueryable()
            .Where(p => order.Items.Select(i => i.ProductId).Contains(p.Id))
            .LoadAsync();

        await _unitOfWork.Dealers.GetQueryable()
            .Where(d => order.Items.Select(i => i.DealerId).Contains(d.Id))
            .LoadAsync();

        return new OrderResponse
        {
            Id = order.Id,
            CustomerId = order.CustomerId,
            CustomerName = customer?.FullName ?? "Unknown",
            Status = order.Status.ToString(),
            TotalAmount = order.TotalAmount,
            ShippingAddress = order.ShippingAddress,
            Items = order.Items.Select(i => new OrderItemResponse
            {
                Id = i.Id,
                ProductId = i.ProductId,
                ProductName = i.Product?.Name ?? "Unknown Product",
                ProductImageUrl = i.Product?.Images.FirstOrDefault()?.ImageUrl,
                DealerId = i.DealerId,
                DealerName = i.Dealer?.ShopName ?? "Unknown Shop",
                Quantity = i.Quantity,
                UnitPriceAtPurchase = i.UnitPriceAtPurchase,
                Subtotal = i.Subtotal
            }).ToList(),
            CreatedAt = order.CreatedAt,
            UpdatedAt = order.UpdatedAt
        };
    }
}
