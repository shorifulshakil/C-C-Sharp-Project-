using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Auth;

public class RegisterRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;

    [Required, MaxLength(256)]
    public string FullName { get; set; } = string.Empty;

    [MaxLength(32)]
    public string? Phone { get; set; }

    [Required]
    public string Role { get; set; } = string.Empty;

    [MaxLength(256)]
    public string? ShopName { get; set; }
}

