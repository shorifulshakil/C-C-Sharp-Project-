using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Order;

public class OrderRequest
{
    [Required]
    public string ShippingAddress { get; set; } = string.Empty;
}
