namespace ECommerce.Domain.Interfaces;
using ECommerce.Domain.Entities;

public interface IJwtTokenGenerator
{
    string GenerateAccessToken(Guid id, string email, string fullName, string role);
    string GenerateRefreshToken();
}
