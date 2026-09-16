using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Product;

public class ProductRequest
{
    [Required, MaxLength(256)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Range(0.01, double.MaxValue)]
    public decimal Price { get; set; }

    [Range(0, int.MaxValue)]
    public int StockQuantity { get; set; }

    [MaxLength(128)]
    public string? Sku { get; set; }

    [Required]
    public Guid CategoryId { get; set; }

    public List<ProductImageDto>? Images { get; set; }
}
