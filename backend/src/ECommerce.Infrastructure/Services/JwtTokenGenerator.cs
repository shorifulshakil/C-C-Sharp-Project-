using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ECommerce.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace ECommerce.Infrastructure.Services;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly string _key;
    private readonly string _issuer;
    private readonly string _audience;
    private readonly int _expiryMinutes;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _key = configuration["JWT_SECRET_KEY"] ?? configuration["Jwt:Key"] ?? "SuperSecretJwtKey123456789012345678901234567890";
        _issuer = configuration["JWT_ISSUER"] ?? configuration["Jwt:Issuer"] ?? "ECommerceAPI";
        _audience = configuration["JWT_AUDIENCE"] ?? configuration["Jwt:Audience"] ?? "ECommerceClient";
        _expiryMinutes = int.Parse(configuration["JWT_ACCESS_TOKEN_EXPIRY_MINUTES"] ?? configuration["Jwt:AccessTokenExpiryMinutes"] ?? "15");
    }

    public string GenerateAccessToken(Guid id, string email, string fullName, string role)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, email),
            new Claim(JwtRegisteredClaimNames.Name, fullName),
            new Claim(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_key));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
        var expires = DateTime.UtcNow.AddMinutes(_expiryMinutes);

        var token = new JwtSecurityToken(
            issuer: _issuer,
            audience: _audience,
            claims: claims,
            expires: expires,
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        return Convert.ToBase64String(Guid.NewGuid().ToByteArray());
    }
}
