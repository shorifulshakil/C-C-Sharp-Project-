namespace ECommerce.Domain.Interfaces;
using ECommerce.Domain.Entities;

public interface IUnitOfWork : IDisposable
{
    IRepository<Admin> Admins { get; }
    IRepository<Customer> Customers { get; }
    IRepository<Dealer> Dealers { get; }
    IRepository<Category> Categories { get; }
    IRepository<Product> Products { get; }
    IRepository<ProductImage> ProductImages { get; }
    IRepository<Cart> Carts { get; }
    IRepository<CartItem> CartItems { get; }
    IRepository<Order> Orders { get; }
    IRepository<OrderItem> OrderItems { get; }

    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
