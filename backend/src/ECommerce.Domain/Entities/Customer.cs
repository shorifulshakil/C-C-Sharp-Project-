using System.ComponentModel.DataAnnotations;

namespace ECommerce.Domain.Entities;

public class Customer : BaseEntity
{
    [MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;

    [MaxLength(256)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(32)]
    public string? Phone { get; set; }

    public string? AvatarUrl { get; set; }

    public string? ShippingAddress { get; set; }

    public bool IsActive { get; set; } = true;

    public Cart? Cart { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
