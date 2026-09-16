using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Admin;

public class UserStatusUpdate
{
    [Required]
    public bool IsActive { get; set; }
}
