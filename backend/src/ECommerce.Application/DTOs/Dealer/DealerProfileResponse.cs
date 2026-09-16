namespace ECommerce.Application.DTOs.Dealer;

public class DealerProfileResponse
{
    public Guid Id { get; set; }
    public string ShopName { get; set; } = string.Empty;
    public string? ShopDescription { get; set; }
    public string ShopCategory { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public string? LogoUrl { get; set; }
    public bool IsApproved { get; set; }
    public DateTime CreatedAt { get; set; }

    // User info
    public string? UserFullName { get; set; }
    public string? UserEmail { get; set; }
    public string? UserPhone { get; set; }
    public string? AvatarUrl { get; set; }
    public bool UserIsActive { get; set; }
    public int CustomerCount { get; set; }
}
