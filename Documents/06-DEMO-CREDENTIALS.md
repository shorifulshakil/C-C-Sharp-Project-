# 06 — Master Demo Credentials

> **WARNING:** These are DEVELOPMENT ONLY credentials. Change before any production deployment.
> **Database Script:** `SQL/master.sql` (Version 3.0)

---

## Master Login Credentials

| Role | Email | Password | Identity / Shop Name | Status |
|------|-------|----------|----------------------|--------|
| **Admin** | `admin@ecommerce.com` | `Admin@123` | System Admin | Active |
| **Dealer** | `dealer1@test.com` | `Dealer@123` | Alex Tech (`AlexTechs Shop`) | Approved & Active |
| **Customer** | `customer1@test.com` | `Customer@123` | John Buyer | Active |

---

## Dynamic Self-Registration Support
In addition to the master demo accounts above, new accounts can be created at any time via `/auth/register`:
- **New Customers:** Can register directly and start shopping immediately.
- **New Dealers:** Can submit shop details (Shop Name, Description, Category, Address) and will start with `IsApproved = false` awaiting Admin moderation from `/admin/dealers`.

---

## Password Security
All passwords in the database are hashed with **BCrypt** (Work Factor / Cost: 11):
- Admin hash: `$2a$11$S2ZoaWf3hknWcI/Og0uzg.vHxucE3fJcbHU91qFAH/p.tYRX4heWy`
- Dealer hash: `$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q`
- Customer hash: `$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te`

---

## Master Database Records Summary (`SQL/master.sql`)

| Table | Records | Description |
|-------|---------|-------------|
| `admins` | 1 | Master platform administrator |
| `dealers` | 1 | Master verified electronics vendor (Alex Tech) |
| `customers` | 1 | Master active retail customer (John Buyer) |
| `categories` | 8 | Core product classifications |
| `products` | 550 | 500 catalog items + 50 extra featured products |
| `product_images` | 550 | High-resolution Picsum CDN seed images (1:1 mapping) |
| `carts` | 1 | Active shopping cart for Customer 1 |
| `cart_items` | Active | Cart line items ready for checkout |
| `orders` | 6 | Realistic orders spanning Pending, Confirmed, Processing, Shipped, Delivered, Cancelled |
| `order_items` | 12–18 | Multi-item vendor fulfillment order items |
