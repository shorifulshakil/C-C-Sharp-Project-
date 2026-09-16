using ECommerce.Application.DTOs.Dealer;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Interfaces;

namespace ECommerce.Application.Services;

public class DealerService : IDealerService
{
    private readonly IUnitOfWork _unitOfWork;

    public DealerService(IUnitOfWork unitOfWork)
    {
        _unitOfWork = unitOfWork;
    }

    public async Task<DealerProfileResponse> GetProfileAsync(Guid userId)
    {
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Dealer not found.");

        return new DealerProfileResponse
        {
            Id = dealer.Id,
            ShopName = dealer.ShopName,
            ShopDescription = dealer.ShopDescription,
            ShopCategory = dealer.ShopCategory,
            Address = dealer.Address,
            LogoUrl = dealer.LogoUrl,
            IsApproved = dealer.IsApproved,
            CreatedAt = dealer.CreatedAt,
            UserFullName = dealer.FullName,
            UserEmail = dealer.Email,
            UserPhone = dealer.Phone,
            AvatarUrl = dealer.AvatarUrl,
            UserIsActive = dealer.IsActive
        };
    }

    public async Task<DealerProfileResponse> UpdateProfileAsync(Guid userId, DealerProfileRequest request)
    {
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(userId)
            ?? throw new KeyNotFoundException("Dealer not found.");

        dealer.ShopName = request.ShopName ?? dealer.ShopName;
        dealer.ShopDescription = request.ShopDescription ?? dealer.ShopDescription;
        dealer.ShopCategory = request.ShopCategory ?? dealer.ShopCategory;
        dealer.Address = request.Address ?? dealer.Address;
        dealer.LogoUrl = request.LogoUrl ?? dealer.LogoUrl;
        if (request.AvatarUrl != null) dealer.AvatarUrl = request.AvatarUrl;
        if (!string.IsNullOrWhiteSpace(request.FullName)) dealer.FullName = request.FullName;
        if (request.Phone != null) dealer.Phone = request.Phone;
        dealer.UpdatedAt = DateTime.UtcNow;

        await _unitOfWork.Dealers.UpdateAsync(dealer);
        await _unitOfWork.SaveChangesAsync();

        return new DealerProfileResponse
        {
            Id = dealer.Id,
            ShopName = dealer.ShopName,
            ShopDescription = dealer.ShopDescription,
            ShopCategory = dealer.ShopCategory,
            Address = dealer.Address,
            LogoUrl = dealer.LogoUrl,
            IsApproved = dealer.IsApproved,
            CreatedAt = dealer.CreatedAt,
            UserFullName = dealer.FullName,
            UserEmail = dealer.Email,
            UserPhone = dealer.Phone,
            AvatarUrl = dealer.AvatarUrl,
            UserIsActive = dealer.IsActive
        };
    }
}
