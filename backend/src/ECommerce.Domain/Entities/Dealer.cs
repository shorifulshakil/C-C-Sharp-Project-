using System.ComponentModel.DataAnnotations;

namespace ECommerce.Domain.Entities;

public class Dealer : BaseEntity
{
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(256)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(32)]
    public string? Phone { get; set; }

    public string? AvatarUrl { get; set; }

    [MaxLength(256)]
    public string ShopName { get; set; } = string.Empty;

    public string? ShopDescription { get; set; }

    [MaxLength(128)]
    public string ShopCategory { get; set; } = string.Empty;

    public string Address { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public bool IsApproved { get; set; } = false;

    public bool IsActive { get; set; } = true;

    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
}
