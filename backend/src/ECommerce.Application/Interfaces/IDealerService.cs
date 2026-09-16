using ECommerce.Application.DTOs.Dealer;
using ECommerce.Application.Interfaces;

namespace ECommerce.Application.Interfaces;

public interface IDealerService
{
    Task<DealerProfileResponse> GetProfileAsync(Guid userId);
    Task<DealerProfileResponse> UpdateProfileAsync(Guid userId, DealerProfileRequest request);
}
