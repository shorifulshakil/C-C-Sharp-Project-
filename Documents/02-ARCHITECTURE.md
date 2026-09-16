# 02 — Architecture

## Overview
This is a **layered monolith** ASP.NET Core Web API with a separate Next.js frontend. The architecture follows clean architecture principles while keeping it simple enough for a university project.

---

## Backend Architecture

### Solution Structure
```
backend/src/
├── ECommerce.API/                    # Presentation Layer
│   ├── Program.cs                    # Entry point, DI registration, middleware pipeline
│   ├── appsettings.json              # Base configuration
│   ├── appsettings.Development.json  # Dev config (Supabase DB, JWT keys)
│   ├── Middleware/
│   │   └── ExceptionHandlingMiddleware.cs  # Global exception handler
│   └── Controllers/
│       ├── AuthController.cs         # Login, Register, Refresh, Me, Profile Update
│       ├── AdminController.cs        # Dealer/Customer/Category/Stats management
│       ├── DealerController.cs       # Dealer profile and product management
│       ├── ProductsController.cs     # Public product browsing + categories
│       ├── CartController.cs         # Shopping cart operations
│       └── OrderController.cs        # Order creation and history
│
├── ECommerce.Application/            # Application Layer
│   ├── Services/
│   │   ├── AuthService.cs            # JWT generation, registration, login, profile update
│   │   ├── AdminService.cs           # Admin CRUD operations (separate tables)
│   │   ├── DealerService.cs          # Dealer profile and product ops
│   │   ├── ProductService.cs         # Public product queries
│   │   ├── CartService.cs            # Cart operations (with Include for items)
│   │   ├── OrderService.cs           # Order creation with batch-loading
│   │   └── CategoryService.cs        # Category management
│   ├── DTOs/                         # Request/Response models
│   │   ├── Auth/                     # LoginRequest, RegisterRequest, AuthResponse, UserDto, UpdateProfileRequest
│   │   ├── Dealer/                   # DealerProfileRequest, DealerProfileResponse, AdminDealerRequest
│   │   ├── Product/                  # ProductRequest, ProductResponse, ProductFilter
│   │   ├── Cart/                     # CartItemRequest, CartItemQuantityRequest, CartItemResponse, CartResponse
│   │   ├── Order/                    # OrderRequest, OrderResponse, OrderItemResponse
│   │   └── Admin/                    # StatsResponse, UserStatusUpdate, RejectProductRequest
│   ├── Interfaces/                   # Service contracts (IAuthService, IAdminService, etc.)
│   ├── Validators/                   # FluentValidation validators
│   └── Mapping/
│       └── MappingProfile.cs         # AutoMapper profile (DTO ↔ Entity)
│
├── ECommerce.Domain/                 # Domain Layer (pure, no dependencies)
│   ├── Entities/
│   │   ├── BaseEntity.cs             # Abstract base with Id, CreatedAt, UpdatedAt
│   │   ├── Admin.cs                  # Admin entity (email, password, name)
│   │   ├── Dealer.cs                 # Dealer entity (shop info + auth fields)
│   │   ├── Customer.cs               # Customer entity (auth fields)
│   │   ├── Category.cs               # Product categories (self-referencing)
│   │   ├── Product.cs                # Products with ApprovalStatus, Dealer nav
│   │   ├── ProductImage.cs           # Multiple images per product
│   │   ├── Cart.cs                   # One active cart per customer
│   │   ├── CartItem.cs               # Items in a cart
│   │   ├── Order.cs                  # Customer orders, Customer nav
│   │   └── OrderItem.cs              # Line items with Dealer nav
│   ├── Enums/
│   │   ├── ApprovalStatus.cs         # Pending, Approved, Rejected, Unpublished
│   │   └── OrderStatus.cs            # Pending, Confirmed, Processing, Shipped, Delivered, Cancelled
│   └── Interfaces/
│       ├── IRepository.cs            # Generic CRUD repository
│       ├── IUnitOfWork.cs            # Transaction management (Admins, Dealers, Customers repos)
│       ├── IJwtTokenGenerator.cs     # JWT token creation
│       └── IPasswordHasher.cs        # Password hashing
│
└── ECommerce.Infrastructure/         # Infrastructure Layer
    ├── Data/
    │   ├── AppDbContext.cs            # EF Core DbContext (Admins, Dealers, Customers DbSets)
    │   └── Configurations/            # Fluent API entity configurations
    │       ├── AdminConfiguration.cs
    │       ├── DealerConfiguration.cs
    │       ├── CustomerConfiguration.cs
    │       ├── CategoryConfiguration.cs
    │       ├── ProductConfiguration.cs
    │       ├── ProductImageConfiguration.cs
    │       ├── CartConfiguration.cs
    │       ├── CartItemConfiguration.cs
    │       ├── OrderConfiguration.cs
    │       └── OrderItemConfiguration.cs
    ├── Repositories/
    │   ├── Repository.cs              # Generic repository implementation
    │   └── UnitOfWork.cs              # Unit of Work implementation
    └── Services/
        ├── JwtTokenGenerator.cs       # JWT creation with HMAC-SHA512
        └── PasswordHasher.cs          # BCrypt password hashing
```

### Layer Responsibilities

| Layer | Responsibility | Depends On |
|-------|---------------|------------|
| **API** | HTTP routing, controllers, middleware, Swagger, DI registration | Application |
| **Application** | Business logic, services, DTOs, validation, orchestration | Domain |
| **Domain** | Entities, enums, domain interfaces, business rules | None (pure) |
| **Infrastructure** | EF Core, database access, repositories, SQL scripts | Domain |

### Dependency Flow
```
API → Application → Domain
       ↓
  Infrastructure → Domain
```

Infrastructure references Domain but not vice versa. Application references Domain. API references Application.

### Key Design Decisions

1. **No CQRS/MediatR:** Overkill for this project size. Simple service layer is sufficient.
2. **No microservices:** Single deployable unit. Easier to develop, test, and deploy.
3. **Repository Pattern:** Abstracts EF Core details from services. Makes testing easier.
4. **DTOs:** Separate request/response models from domain entities. Prevents over-posting.
5. **FluentValidation:** Used alongside Data Annotations for complex validation rules.
6. **Global Exception Handling:** Custom middleware catches all exceptions and returns consistent error responses.
7. **Separate Auth Tables:** `admins`, `dealers`, `customers` tables instead of single User table with roles.
8. **SQL-based Seeding:** Database seeded via SQL scripts, not code-based seeder.
9. **Batch-loading in OrderService:** Avoids single-query explosion with deep .Include() chains.
10. **String-based enum storage:** OrderStatus and ApprovalStatus stored as VARCHAR with HasConversion.

---

## Frontend Architecture

### Directory Structure
```
frontend/
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout (providers, fonts)
│   ├── page.tsx                      # Redirects to / (home)
│   ├── globals.css                   # Global styles + Tailwind
│   ├── error.tsx                     # Error boundary
│   ├── loading.tsx                   # Loading state
│   ├── not-found.tsx                 # 404 page
│   │
│   ├── (shop)/                       # Public storefront (with Navbar + Footer)
│   │   ├── layout.tsx                # ShopLayout wrapper
│   │   ├── page.tsx                  # Home page (hero, categories, products by category)
│   │   ├── about/page.tsx            # About page
│   │   ├── contact/page.tsx          # Contact page with form
│   │   ├── products/page.tsx         # Product listing with filters
│   │   ├── products/[id]/page.tsx    # Product detail
│   │   ├── cart/page.tsx             # Shopping cart
│   │   ├── checkout/page.tsx         # Checkout flow
│   │   ├── orders/page.tsx           # Order history
│   │   ├── orders/[id]/page.tsx      # Order detail
│   │   └── account/page.tsx          # User profile + password change
│   │
│   ├── auth/                         # Authentication pages
│   │   ├── layout.tsx                # Auth layout (centered card)
│   │   ├── login/page.tsx            # Login form
│   │   └── register/page.tsx         # Registration form
│   │
│   ├── admin/                        # Admin dashboard
│   │   ├── dashboard/page.tsx        # Admin stats overview
│   │   ├── dealers/page.tsx          # Dealer management (CRUD + filters)
│   │   ├── users/page.tsx            # Customer management
│   │   ├── products/pending/page.tsx # Pending product approval
│   │   ├── categories/page.tsx       # Category management
│   │   ├── stats/page.tsx            # Platform statistics
│   │   └── profile/page.tsx          # Admin profile management
│   │
│   └── dealer/                       # Dealer dashboard
│       ├── dashboard/page.tsx        # Dealer stats + recent products
│       ├── products/page.tsx         # Dealer product list
│       ├── products/new/page.tsx     # Create new product
│       ├── products/[id]/edit/page.tsx # Edit product
│       └── orders/page.tsx           # Dealer orders
│
├── components/
│   ├── ui/                           # Shared UI kit
│   │   ├── Button.tsx                # Button with variants (primary, secondary, danger, ghost)
│   │   ├── Input.tsx                 # Text input with label, error state
│   │   ├── Textarea.tsx              # Multi-line text input
│   │   ├── Select.tsx                # Dropdown select
│   │   ├── Card.tsx                  # Card container
│   │   ├── Badge.tsx                 # Status badges (colored)
│   │   ├── Modal.tsx                 # Modal dialog
│   │   ├── ConfirmDialog.tsx         # Confirmation dialog
│   │   ├── Table.tsx                 # Data table
│   │   ├── Pagination.tsx            # Page navigation
│   │   ├── Spinner.tsx               # Loading spinner
│   │   ├── EmptyState.tsx            # Empty state placeholder
│   │   ├── ProductCardSkeleton.tsx   # Skeleton for product cards
│   │   ├── ProductGridSkeleton.tsx   # Grid of skeleton cards
│   │   ├── ProductDetailSkeleton.tsx # Skeleton for product detail
│   │   ├── LoadingProgress.tsx       # Top progress bar with percentage
│   │   └── index.ts                  # Barrel exports
│   │
│   └── layout/                       # Layout components
│       ├── Navbar.tsx                 # Top navigation (logo, links, user dropdown, mobile menu)
│       ├── Footer.tsx                 # Footer with 5 columns (brand, shop, company, support, newsletter)
│       ├── Sidebar.tsx                # Dashboard sidebar (admin/dealer navigation)
│       ├── DashboardLayout.tsx        # Dashboard layout (sidebar + content)
│       └── ShopLayout.tsx             # Shop layout (navbar + content + footer)
│
├── features/
│   ├── auth/                         # Authentication feature
│   │   ├── AuthProvider.tsx           # React Context for auth state
│   │   ├── ProtectedRoute.tsx         # Route guard component
│   │   └── index.ts                   # Barrel exports
│   └── products/                     # Products feature
│       ├── ProductCard.tsx            # Product card with hover effects, add-to-cart
│       └── index.ts                   # Barrel exports
│
├── services/
│   └── api.ts                        # Axios-based API client with interceptors
│
├── hooks/
│   ├── index.ts                      # Custom React hooks
│   └── useLoadingProgress.ts         # Loading progress hook
│
├── types/
│   └── index.ts                      # TypeScript interfaces
│
└── lib/
    └── utils.ts                      # Utility functions (cn, formatPrice, formatDate)
```

### Key Design Decisions

1. **App Router:** Next.js 14+ App Router for better performance and React Server Components support.
2. **Route Groups:** `(shop)` for public storefront pages with Navbar + Footer layout.
3. **Feature-based organization:** `features/` groups related components and hooks.
4. **Shared UI Kit:** Consistent design system built once in `components/ui/`.
5. **API Client:** Centralized in `services/api.ts` with typed methods for each endpoint.
6. **No state management library:** React Context + hooks sufficient for this project size.

---

## Security Architecture

| Concern | Implementation |
|---------|---------------|
| Authentication | JWT Bearer tokens (15-min access, 7-day refresh) |
| Authorization | `[Authorize(Roles = "...")]` + ownership checks from JWT claims |
| Password Storage | BCrypt.Net-Next (cost factor 11) |
| Input Validation | Data Annotations + FluentValidation |
| CORS | Locked to frontend origin only |
| Secrets | Environment variables, `appsettings.Development.json` |
| Error Handling | Global middleware — no stack traces in responses |
| SQL Injection | Prevented by EF Core parameterized queries |

---

## Database Architecture

- **PostgreSQL** via EF Core 9.0 (Npgsql provider)
- **Cloud-hosted** on Supabase (not local)
- **SQL-based seeding** via scripts in `SQL/database.sql`
- **Foreign keys** with proper cascade rules
- **Indexes** on frequently queried columns (ApprovalStatus, CategoryId, DealerId)
- **Transactions** for order creation + stock decrement
- **String-based enums** for OrderStatus and ApprovalStatus (stored as VARCHAR)

---

## Environment Configuration

### Backend (`appsettings.Development.json`)
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=aws-0-ap-south-1.pooler.supabase.com;Port=6543;Database=postgres;Username=postgres.pqkgfmbnvvrsntoqhhoo;Password=L8hgSMS%24zD-6.2w;SSL Mode=Require;Command Timeout=120;Timeout=60;Keepalive=30;Pooling=false"
  },
  "JwtSettings": {
    "SecretKey": "SUPER_SECRET_KEY_MUST_BE_LONG_ENOUGH_1234567890",
    "Issuer": "ECommerceAPI",
    "Audience": "ECommerceApp",
    "AccessTokenExpiryMinutes": 15,
    "RefreshTokenExpiryDays": 7
  }
}
```

### Frontend (`.env.local`)
```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
NEXT_PUBLIC_API_TIMEOUT=30000
NEXT_PUBLIC_APP_NAME=E-Commerce Platform
```
