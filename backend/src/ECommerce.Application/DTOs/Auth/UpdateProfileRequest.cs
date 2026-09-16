using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Auth;

public class UpdateProfileRequest
{
    [MaxLength(256)]
    public string? FullName { get; set; }

    [EmailAddress, MaxLength(256)]
    public string? Email { get; set; }

    [MaxLength(32)]
    public string? Phone { get; set; }

    public string? AvatarUrl { get; set; }

    public string? ShippingAddress { get; set; }

    [MinLength(6)]
    public string? NewPassword { get; set; }

    public string? CurrentPassword { get; set; }
}
