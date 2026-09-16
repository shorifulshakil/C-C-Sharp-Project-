namespace ECommerce.Domain.Entities;

public class ProductImage : BaseEntity
{
    public string ImageUrl { get; set; } = string.Empty;

    public int DisplayOrder { get; set; } = 0;

    public Guid ProductId { get; set; }
    public Product Product { get; set; } = null!;
}
