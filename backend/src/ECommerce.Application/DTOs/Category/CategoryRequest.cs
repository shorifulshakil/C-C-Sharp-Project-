using System.ComponentModel.DataAnnotations;

namespace ECommerce.Application.DTOs.Category;

public class CategoryRequest
{
    [Required, MaxLength(128)]
    public string Name { get; set; } = string.Empty;

    public string? Description { get; set; }

    public Guid? ParentCategoryId { get; set; }
}
