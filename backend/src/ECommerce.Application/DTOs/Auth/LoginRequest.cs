using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Auth;

public class LoginRequest
{
    [Required, EmailAddress, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required, MinLength(6)]
    public string Password { get; set; } = string.Empty;
}
