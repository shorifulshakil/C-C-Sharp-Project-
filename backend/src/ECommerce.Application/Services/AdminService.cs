using AutoMapper;
using ECommerce.Application.DTOs.Admin;
using ECommerce.Application.DTOs.Auth;
using ECommerce.Application.DTOs.Dealer;
using ECommerce.Application.Interfaces;
using ECommerce.Domain.Entities;
using ECommerce.Domain.Enums;
using ECommerce.Domain.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace ECommerce.Application.Services;

public class AdminService : IAdminService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;
    private readonly IPasswordHasher _passwordHasher;

    public AdminService(IUnitOfWork unitOfWork, IMapper mapper, IPasswordHasher passwordHasher)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
        _passwordHasher = passwordHasher;
    }

    public async Task<List<UserDto>> GetAllUsersAsync(string? role, bool? isActive, string? search, int page, int pageSize)
    {
        var results = new List<UserDto>();

        // Get customers
        if (string.IsNullOrWhiteSpace(role) || role.Equals("Customer", StringComparison.OrdinalIgnoreCase))
        {
            var query = _unitOfWork.Customers.GetQueryable();
            if (isActive.HasValue) query = query.Where(c => c.IsActive == isActive.Value);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(c => c.Email.Contains(search) || c.FullName.Contains(search));
            var customers = await query.OrderBy(c => c.FullName).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            results.AddRange(customers.Select(c => new UserDto
            {
                Id = c.Id.ToString(),
                Email = c.Email,
                FullName = c.FullName,
                Phone = c.Phone,
                Role = "Customer",
                IsActive = c.IsActive,
                CreatedAt = c.CreatedAt
            }));
        }

        // Get admins
        if (string.IsNullOrWhiteSpace(role) || role.Equals("Admin", StringComparison.OrdinalIgnoreCase))
        {
            var query = _unitOfWork.Admins.GetQueryable();
            if (isActive.HasValue) query = query.Where(a => a.IsActive == isActive.Value);
            if (!string.IsNullOrWhiteSpace(search))
                query = query.Where(a => a.Email.Contains(search) || a.FullName.Contains(search));
            var admins = await query.OrderBy(a => a.FullName).Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
            results.AddRange(admins.Select(a => new UserDto
            {
                Id = a.Id.ToString(),
                Email = a.Email,
                FullName = a.FullName,
                Phone = a.Phone,
                Role = "Admin",
                IsActive = a.IsActive,
                CreatedAt = a.CreatedAt
            }));
        }

        return results.OrderBy(r => r.FullName).ToList();
    }

    public async Task<UserDto> UpdateUserStatusAsync(Guid userId, UserStatusUpdate request)
    {
        // Try admins
        var admin = await _unitOfWork.Admins.GetByIdAsync(userId);
        if (admin != null)
        {
            admin.IsActive = request.IsActive;
            admin.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Admins.UpdateAsync(admin);
            await _unitOfWork.SaveChangesAsync();
            return new UserDto { Id = admin.Id.ToString(), Email = admin.Email, FullName = admin.FullName, Phone = admin.Phone, Role = "Admin", IsActive = admin.IsActive, CreatedAt = admin.CreatedAt };
        }

        // Try customers
        var customer = await _unitOfWork.Customers.GetByIdAsync(userId);
        if (customer != null)
        {
            customer.IsActive = request.IsActive;
            customer.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Customers.UpdateAsync(customer);
            await _unitOfWork.SaveChangesAsync();
            return new UserDto { Id = customer.Id.ToString(), Email = customer.Email, FullName = customer.FullName, Phone = customer.Phone, Role = "Customer", IsActive = customer.IsActive, CreatedAt = customer.CreatedAt };
        }

        // Try dealers
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(userId);
        if (dealer != null)
        {
            dealer.IsActive = request.IsActive;
            dealer.UpdatedAt = DateTime.UtcNow;
            await _unitOfWork.Dealers.UpdateAsync(dealer);
            await _unitOfWork.SaveChangesAsync();
            return new UserDto { Id = dealer.Id.ToString(), Email = dealer.Email, FullName = dealer.FullName, Phone = dealer.Phone, Role = "Dealer", IsActive = dealer.IsActive, CreatedAt = dealer.CreatedAt };
        }

        throw new KeyNotFoundException("User not found.");
    }

    public async Task<List<DealerProfileResponse>> GetAllDealersAsync(string? search, string? category, int page, int pageSize)
    {
        var query = _unitOfWork.Dealers.GetQueryable().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
            query = query.Where(d => d.ShopName.Contains(search) || d.FullName.Contains(search));

        if (!string.IsNullOrWhiteSpace(category))
            query = query.Where(d => d.ShopCategory == category);

        query = query.OrderBy(d => d.ShopName);

        var dealers = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();
        var dealerIds = dealers.Select(d => d.Id).ToList();

        var dealerOrderItems = await _unitOfWork.OrderItems.GetQueryable()
            .Where(i => dealerIds.Contains(i.DealerId))
            .Select(i => new { i.DealerId, i.OrderId })
            .Distinct()
            .ToListAsync();

        var orderIds = dealerOrderItems.Select(i => i.OrderId).Distinct().ToList();
        var orders = await _unitOfWork.Orders.GetQueryable()
            .Where(o => orderIds.Contains(o.Id))
            .Select(o => new { o.Id, o.CustomerId })
            .ToListAsync();

        var orderToCustomerMap = orders.ToDictionary(o => o.Id, o => o.CustomerId);

        var dealerCustomerCounts = dealerOrderItems
            .Where(i => orderToCustomerMap.ContainsKey(i.OrderId))
            .GroupBy(i => i.DealerId)
            .ToDictionary(g => g.Key, g => g.Select(i => orderToCustomerMap[i.OrderId]).Distinct().Count());

        return dealers.Select(d => new DealerProfileResponse
        {
            Id = d.Id,
            ShopName = d.ShopName,
            ShopDescription = d.ShopDescription,
            ShopCategory = d.ShopCategory,
            Address = d.Address,
            LogoUrl = d.LogoUrl,
            IsApproved = d.IsApproved,
            CreatedAt = d.CreatedAt,
            UserFullName = d.FullName,
            UserEmail = d.Email,
            UserPhone = d.Phone,
            UserIsActive = d.IsActive,
            CustomerCount = dealerCustomerCounts.GetValueOrDefault(d.Id, 0)
        }).ToList();
    }

    public async Task<DealerProfileResponse?> GetDealerByIdAsync(Guid dealerId)
    {
        var d = await _unitOfWork.Dealers.GetByIdAsync(dealerId);
        if (d == null) return null;
        return new DealerProfileResponse
        {
            Id = d.Id,
            ShopName = d.ShopName,
            ShopDescription = d.ShopDescription,
            ShopCategory = d.ShopCategory,
            Address = d.Address,
            LogoUrl = d.LogoUrl,
            IsApproved = d.IsApproved,
            CreatedAt = d.CreatedAt,
            UserFullName = d.FullName,
            UserEmail = d.Email,
            UserPhone = d.Phone,
            UserIsActive = d.IsActive
        };
    }

    public async Task<DealerProfileResponse> CreateDealerAsync(AdminDealerRequest request)
    {
        var dealer = new Dealer
        {
            Id = Guid.NewGuid(),
            Email = request.Email,
            FullName = request.FullName,
            Phone = request.Phone,
            IsActive = true,
            PasswordHash = _passwordHasher.Hash(request.Password),
            ShopName = request.ShopName,
            ShopDescription = request.ShopDescription,
            ShopCategory = request.ShopCategory,
            Address = request.Address,
            LogoUrl = request.LogoUrl,
            IsApproved = request.IsApproved
        };
        await _unitOfWork.Dealers.AddAsync(dealer);
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
            UserIsActive = dealer.IsActive
        };
    }

    public async Task<DealerProfileResponse?> UpdateDealerAsync(Guid dealerId, AdminDealerRequest request)
    {
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(dealerId);
        if (dealer == null) return null;

        if (!string.IsNullOrWhiteSpace(request.ShopName)) dealer.ShopName = request.ShopName;
        dealer.ShopDescription = request.ShopDescription;
        if (!string.IsNullOrWhiteSpace(request.ShopCategory)) dealer.ShopCategory = request.ShopCategory;
        if (!string.IsNullOrWhiteSpace(request.Address)) dealer.Address = request.Address;
        dealer.LogoUrl = request.LogoUrl;
        dealer.IsApproved = request.IsApproved;
        if (!string.IsNullOrWhiteSpace(request.FullName)) dealer.FullName = request.FullName;
        if (!string.IsNullOrWhiteSpace(request.Email)) dealer.Email = request.Email;
        if (request.Phone != null) dealer.Phone = request.Phone;
        if (!string.IsNullOrWhiteSpace(request.Password) && request.Password != "placeholder")
        {
            dealer.PasswordHash = _passwordHasher.Hash(request.Password);
        }
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
            UserIsActive = dealer.IsActive
        };
    }

    public async Task<bool> DeleteDealerAsync(Guid dealerId)
    {
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(dealerId);
        if (dealer == null) return false;

        await _unitOfWork.Dealers.DeleteAsync(dealer);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ApproveDealerAsync(Guid dealerId)
    {
        var dealer = await _unitOfWork.Dealers.GetByIdAsync(dealerId);
        if (dealer == null) return false;

        dealer.IsApproved = true;
        dealer.UpdatedAt = DateTime.UtcNow;
        await _unitOfWork.Dealers.UpdateAsync(dealer);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<StatsResponse> GetStatsAsync()
    {
        var admins = await _unitOfWork.Admins.CountAsync();
        var dealers = await _unitOfWork.Dealers.CountAsync();
        var customers = await _unitOfWork.Customers.CountAsync();
        var products = await _unitOfWork.Products.GetQueryable().ToListAsync();
        var orders = await _unitOfWork.Orders.GetQueryable().ToListAsync();

        var totalRevenue = orders.Where(o => o.Status != OrderStatus.Cancelled).Sum(o => o.TotalAmount);

        return new StatsResponse
        {
            TotalUsers = admins + dealers + customers,
            TotalDealers = dealers,
            TotalCustomers = customers,
            TotalProducts = products.Count,
            PendingProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Pending),
            ApprovedProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Approved),
            RejectedProducts = products.Count(p => p.ApprovalStatus == ApprovalStatus.Rejected),
            TotalOrders = orders.Count,
            TotalRevenue = totalRevenue
        };
    }

    public async Task<List<UserDto>> GetDealerCustomersAsync(Guid dealerId)
    {
        var orderIds = await _unitOfWork.OrderItems.GetQueryable()
            .Where(i => i.DealerId == dealerId)
            .Select(i => i.OrderId)
            .Distinct()
            .ToListAsync();

        var customerIds = await _unitOfWork.Orders.GetQueryable()
            .Where(o => orderIds.Contains(o.Id))
            .Select(o => o.CustomerId)
            .Distinct()
            .ToListAsync();

        List<Domain.Entities.Customer> customers;
        if (customerIds.Any())
        {
            customers = await _unitOfWork.Customers.GetQueryable()
                .Where(c => customerIds.Contains(c.Id))
                .OrderBy(c => c.FullName)
                .ToListAsync();
        }
        else
        {
            customers = new List<Domain.Entities.Customer>();
        }

        return customers.Select(c => new UserDto
        {
            Id = c.Id.ToString(),
            Email = c.Email,
            FullName = c.FullName,
            Phone = c.Phone,
            Role = "Customer",
            IsActive = c.IsActive,
            CreatedAt = c.CreatedAt
        }).ToList();
    }
}
