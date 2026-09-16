using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Dealer;

public class AdminDealerRequest
{
    [Required, MaxLength(256)]
    public string ShopName { get; set; } = string.Empty;

    public string? ShopDescription { get; set; }

    [Required, MaxLength(128)]
    public string ShopCategory { get; set; } = string.Empty;

    [Required]
    public string Address { get; set; } = string.Empty;

    public string? LogoUrl { get; set; }

    public bool IsApproved { get; set; } = false;

    // User fields for creating a new dealer user
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required, MaxLength(256)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(32)]
    public string? Phone { get; set; }
}
