using AutoMapper;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IMapper _mapper;

    public AuthService(IUnitOfWork unitOfWork, IJwtTokenGenerator jwtTokenGenerator, IPasswordHasher passwordHasher, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _jwtTokenGenerator = jwtTokenGenerator;
        _passwordHasher = passwordHasher;
        _mapper = mapper;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        var role = string.IsNullOrWhiteSpace(request.Role) ? "Customer" : request.Role;

        // Check email uniqueness across all tables
        var existsInAdmins = await _unitOfWork.Admins.GetQueryable().AnyAsync(a => a.Email == request.Email);
        var existsInDealers = await _unitOfWork.Dealers.GetQueryable().AnyAsync(d => d.Email == request.Email);
        var existsInCustomers = await _unitOfWork.Customers.GetQueryable().AnyAsync(c => c.Email == request.Email);

        if (existsInAdmins || existsInDealers || existsInCustomers)
            throw new InvalidOperationException("Email already exists");

        if (role.Equals("Dealer", StringComparison.OrdinalIgnoreCase))
        {
            var dealer = new Dealer
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FullName = request.FullName,
                Phone = request.Phone,
                IsActive = true,
                ShopName = !string.IsNullOrWhiteSpace(request.ShopName) ? request.ShopName.Trim() : (request.FullName + "'s Shop"),
                ShopCategory = "General",
                Address = "Not specified"
            };
            await _unitOfWork.Dealers.AddAsync(dealer);
            await _unitOfWork.SaveChangesAsync();

            var token = _jwtTokenGenerator.GenerateAccessToken(dealer.Id, dealer.Email, dealer.FullName, "Dealer");
            return new AuthResponse
            {
                Token = token,
                RefreshToken = _jwtTokenGenerator.GenerateRefreshToken(),
                Id = dealer.Id.ToString(),
                Email = dealer.Email,
                FullName = dealer.FullName,
                Role = "Dealer"
            };
        }
        else
        {
            // Default to Customer
            var customer = new Customer
            {
                Id = Guid.NewGuid(),
                Email = request.Email,
                FullName = request.FullName,
                Phone = request.Phone,
                IsActive = true,
                PasswordHash = _passwordHasher.Hash(request.Password)
            };
            await _unitOfWork.Customers.AddAsync(customer);
            await _unitOfWork.SaveChangesAsync();

            var token = _jwtTokenGenerator.GenerateAccessToken(customer.Id, customer.Email, customer.FullName, "Customer");
            return new AuthResponse
            {
                Token = token,
                RefreshToken = _jwtTokenGenerator.GenerateRefreshToken(),
                Id = customer.Id.ToString(),
                Email = customer.Email,
                FullName = customer.FullName,
                Role = "Customer"
            };
        }
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        // Check admins table
        var admin = await _unitOfWork.Admins.GetQueryable()
            .FirstOrDefaultAsync(a => a.Email == request.Email);
        if (admin != null)
        {
            if (!admin.IsActive)
                throw new UnauthorizedAccessException("Invalid credentials or inactive user");
            if (!_passwordHasher.Verify(request.Password, admin.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials");

            if (string.IsNullOrEmpty(admin.PasswordHash) || !admin.PasswordHash.StartsWith("$2"))
            {
                admin.PasswordHash = _passwordHasher.Hash(request.Password);
                await _unitOfWork.Admins.UpdateAsync(admin);
                await _unitOfWork.SaveChangesAsync();
            }

            var token = _jwtTokenGenerator.GenerateAccessToken(admin.Id, admin.Email, admin.FullName, "Admin");
            return new AuthResponse
            {
                Token = token,
                RefreshToken = _jwtTokenGenerator.GenerateRefreshToken(),
                Id = admin.Id.ToString(),
                Email = admin.Email,
                FullName = admin.FullName,
                Role = "Admin"
            };
        }

        // Check dealers table
        var dealer = await _unitOfWork.Dealers.GetQueryable()
            .FirstOrDefaultAsync(d => d.Email == request.Email);
        if (dealer != null)
        {
            if (!dealer.IsActive)
                throw new UnauthorizedAccessException("Invalid credentials or inactive user");
            if (!_passwordHasher.Verify(request.Password, dealer.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials");

            if (string.IsNullOrEmpty(dealer.PasswordHash) || !dealer.PasswordHash.StartsWith("$2"))
            {
                dealer.PasswordHash = _passwordHasher.Hash(request.Password);
                await _unitOfWork.Dealers.UpdateAsync(dealer);
                await _unitOfWork.SaveChangesAsync();
            }

            var token = _jwtTokenGenerator.GenerateAccessToken(dealer.Id, dealer.Email, dealer.FullName, "Dealer");
            return new AuthResponse
            {
                Token = token,
                RefreshToken = _jwtTokenGenerator.GenerateRefreshToken(),
                Id = dealer.Id.ToString(),
                Email = dealer.Email,
                FullName = dealer.FullName,
                Role = "Dealer"
            };
        }

        // Check customers table
        var customer = await _unitOfWork.Customers.GetQueryable()
            .FirstOrDefaultAsync(c => c.Email == request.Email);
        if (customer != null)
        {
            if (!customer.IsActive)
                throw new UnauthorizedAccessException("Invalid credentials or inactive user");
            if (!_passwordHasher.Verify(request.Password, customer.PasswordHash))
                throw new UnauthorizedAccessException("Invalid credentials");

            if (string.IsNullOrEmpty(customer.PasswordHash) || !customer.PasswordHash.StartsWith("$2"))
            {
                customer.PasswordHash = _passwordHasher.Hash(request.Password);
                await _unitOfWork.Customers.UpdateAsync(customer);
                await _unitOfWork.SaveChangesAsync();
            }

            var token = _jwtTokenGenerator.GenerateAccessToken(customer.Id, customer.Email, customer.FullName, "Customer");
            return new AuthResponse
            {
                Token = token,
                RefreshToken = _jwtTokenGenerator.GenerateRefreshToken(),
                Id = customer.Id.ToString(),
                Email = customer.Email,
                FullName = customer.FullName,
                Role = "Customer"
            };
        }

        throw new UnauthorizedAccessException("Invalid credentials or inactive user");
    }

    public async Task<UserDto> GetMeAsync(Guid userId)
    {
        // Check admins
        var admin = await _unitOfWork.Admins.GetByIdAsync(userId);
        if (admin != null)
        {
            return new UserDto
            {
                Id = admin.Id.ToString(),
                Email = admin.Email,
                FullName = admin.FullName,
                Phone = admin.Phone,
                AvatarUrl = admin.AvatarUrl,
                Role = "Admin",
                IsActive = admin.IsActive,
                CreatedAt = admin.CreatedAt
            };
        }

        // Check dealers
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(userId);
        if (dealer != null)
        {
            return new UserDto
            {
                Id = dealer.Id.ToString(),
                Email = dealer.Email,
                FullName = dealer.FullName,
                Phone = dealer.Phone,
                AvatarUrl = dealer.AvatarUrl,
                Role = "Dealer",
                IsActive = dealer.IsActive,
                CreatedAt = dealer.CreatedAt
            };
        }

        // Check customers
        var customer = await _unitOfWork.Customers.GetByIdAsync(userId);
        if (customer != null)
        {
            return new UserDto
            {
                Id = customer.Id.ToString(),
                Email = customer.Email,
                FullName = customer.FullName,
                Phone = customer.Phone,
                AvatarUrl = customer.AvatarUrl,
                ShippingAddress = customer.ShippingAddress,
                Role = "Customer",
                IsActive = customer.IsActive,
                CreatedAt = customer.CreatedAt
            };
        }

        throw new KeyNotFoundException("User not found");
    }

    public Task<AuthResponse> RefreshTokenAsync(RefreshTokenRequest request)
    {
        throw new UnauthorizedAccessException("Refresh token expired. Please log in again.");
    }

    public async Task<UserDto> UpdateProfileAsync(Guid userId, UpdateProfileRequest request)
    {
        // Check admins
        var admin = await _unitOfWork.Admins.GetByIdAsync(userId);
        if (admin != null)
        {
            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                if (!string.IsNullOrWhiteSpace(request.CurrentPassword))
                {
                    if (!_passwordHasher.Verify(request.CurrentPassword, admin.PasswordHash))
                        throw new InvalidOperationException("Current password is incorrect");
                }
                admin.PasswordHash = _passwordHasher.Hash(request.NewPassword);
            }
            if (!string.IsNullOrWhiteSpace(request.FullName))
                admin.FullName = request.FullName;
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var exists = await _unitOfWork.Admins.GetQueryable().AnyAsync(a => a.Email == request.Email && a.Id != userId);
                if (exists) throw new InvalidOperationException("Email is already taken by another user");
                admin.Email = request.Email;
            }
            if (request.Phone != null) admin.Phone = request.Phone;
            if (request.AvatarUrl != null) admin.AvatarUrl = request.AvatarUrl;
            admin.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Admins.UpdateAsync(admin);
            await _unitOfWork.SaveChangesAsync();
            return new UserDto
            {
                Id = admin.Id.ToString(),
                Email = admin.Email,
                FullName = admin.FullName,
                Phone = admin.Phone,
                AvatarUrl = admin.AvatarUrl,
                Role = "Admin",
                IsActive = admin.IsActive,
                CreatedAt = admin.CreatedAt
            };
        }

        // Check dealers
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(userId);
        if (dealer != null)
        {
            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                if (!string.IsNullOrWhiteSpace(request.CurrentPassword))
                {
                    if (!_passwordHasher.Verify(request.CurrentPassword, dealer.PasswordHash))
                        throw new InvalidOperationException("Current password is incorrect");
                }
                dealer.PasswordHash = _passwordHasher.Hash(request.NewPassword);
            }
            if (!string.IsNullOrWhiteSpace(request.FullName))
                dealer.FullName = request.FullName;
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var exists = await _unitOfWork.Dealers.GetQueryable().AnyAsync(d => d.Email == request.Email && d.Id != userId);
                if (exists) throw new InvalidOperationException("Email is already taken by another user");
                dealer.Email = request.Email;
            }
            if (request.Phone != null) dealer.Phone = request.Phone;
            if (request.AvatarUrl != null) dealer.AvatarUrl = request.AvatarUrl;
            dealer.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Dealers.UpdateAsync(dealer);
            await _unitOfWork.SaveChangesAsync();
            return new UserDto
            {
                Id = dealer.Id.ToString(),
                Email = dealer.Email,
                FullName = dealer.FullName,
                Phone = dealer.Phone,
                AvatarUrl = dealer.AvatarUrl,
                Role = "Dealer",
                IsActive = dealer.IsActive,
                CreatedAt = dealer.CreatedAt
            };
        }

        // Check customers
        var customer = await _unitOfWork.Customers.GetByIdAsync(userId);
        if (customer != null)
        {
            if (!string.IsNullOrWhiteSpace(request.NewPassword))
            {
                if (!string.IsNullOrWhiteSpace(request.CurrentPassword))
                {
                    if (!_passwordHasher.Verify(request.CurrentPassword, customer.PasswordHash))
                        throw new InvalidOperationException("Current password is incorrect");
                }
                customer.PasswordHash = _passwordHasher.Hash(request.NewPassword);
            }
            if (!string.IsNullOrWhiteSpace(request.FullName))
                customer.FullName = request.FullName;
            if (!string.IsNullOrWhiteSpace(request.Email))
            {
                var exists = await _unitOfWork.Customers.GetQueryable().AnyAsync(c => c.Email == request.Email && c.Id != userId);
                if (exists) throw new InvalidOperationException("Email is already taken by another user");
                customer.Email = request.Email;
            }
            if (request.Phone != null) customer.Phone = request.Phone;
            if (request.AvatarUrl != null) customer.AvatarUrl = request.AvatarUrl;
            if (request.ShippingAddress != null) customer.ShippingAddress = request.ShippingAddress;
            customer.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Customers.UpdateAsync(customer);
            await _unitOfWork.SaveChangesAsync();
            return new UserDto
            {
                Id = customer.Id.ToString(),
                Email = customer.Email,
                FullName = customer.FullName,
                Phone = customer.Phone,
                AvatarUrl = customer.AvatarUrl,
                ShippingAddress = customer.ShippingAddress,
                Role = "Customer",
                IsActive = customer.IsActive,
                CreatedAt = customer.CreatedAt
            };
        }

        throw new KeyNotFoundException("User not found");
    }
}
