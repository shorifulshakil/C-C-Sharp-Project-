using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Dealer;

namespace ECommerce.Application.Interfaces;

public interface IAdminService
{
    Task<List<UserDto>> GetAllUsersAsync(string? role, bool? isActive, string? search, int page, int pageSize);
    Task<UserDto> UpdateUserStatusAsync(Guid userId, UserStatusUpdate request);
    Task<List<DealerProfileResponse>> GetAllDealersAsync(string? search, string? category, int page, int pageSize);
    Task<DealerProfileResponse?> GetDealerByIdAsync(Guid dealerId);
    Task<DealerProfileResponse> CreateDealerAsync(AdminDealerRequest request);
    Task<DealerProfileResponse?> UpdateDealerAsync(Guid dealerId, AdminDealerRequest request);
    Task<bool> DeleteDealerAsync(Guid dealerId);
    Task<bool> ApproveDealerAsync(Guid dealerId);
    Task<List<UserDto>> GetDealerCustomersAsync(Guid dealerId);
    Task<StatsResponse> GetStatsAsync();
}
