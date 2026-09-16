MASTER DATABASE SCHEMA SQL
===========================

The authoritative, master PostgreSQL schema and database seed script is located at: SQL/master.sql

Database Engine: PostgreSQL 14+
Cloud Host: Supabase (AWS ap-south-1)
Schema Version: 3.0 (Dedicated Role Tables + Profile Avatars + Order Status Lifecycle)
File Path: SQL/master.sql
Total Lines: ~695 lines

Key Architectural Design:
1. Role-Segregated Authentication:
   - Completely separates user identities into three dedicated tables: 'admins', 'dealers', and 'customers'.
   - Avoids single-table discriminator issues, allowing domain-specific columns (e.g. ShopName, ShopCategory, ShippingAddress, AvatarUrl).
2. Modern Media & Profile Integration:
   - Stores 'AvatarUrl' across Admins, Dealers, and Customers for seamless profile representation.
   - Products link to 'product_images' with ordering and URLs.
3. Realistic E-Commerce Lifecycle:
   - Includes seed data for 1 Admin, 1 Verified Dealer (Alex Tech / AlexTechs Shop) with 550 products & images,
     1 Active Customer (John Buyer), and 6 complete multi-item orders covering the full lifecycle
     ('Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled').

Schema Structure:
-----------------
1. DROP EXISTING TABLES (lines 19-32)
   - Drops order_items, orders, cart_items, carts, product_images, products,
     dealer_profiles, customer_profiles, categories, users, dealers, customers, admins CASCADE.
2. CREATE TABLES (lines 40-288)
   - admins (Id, Email, PasswordHash, FullName, Phone, AvatarUrl, IsActive, CreatedAt, UpdatedAt)
   - dealers (Id, Email, PasswordHash, FullName, Phone, AvatarUrl, ShopName, ShopDescription, ShopCategory, Address, LogoUrl, IsApproved, IsActive, CreatedAt, UpdatedAt)
   - customers (Id, Email, PasswordHash, FullName, Phone, AvatarUrl, ShippingAddress, IsActive, CreatedAt, UpdatedAt)
   - categories (Id, Name, Description, ParentCategoryId, CreatedAt, UpdatedAt)
   - products (Id, Name, Description, Price, StockQuantity, Sku, ApprovalStatus, RejectionReason, PublishedAt, DealerId, CategoryId, CreatedAt, UpdatedAt)
   - product_images (Id, ImageUrl, DisplayOrder, ProductId, CreatedAt, UpdatedAt)
   - carts (Id, CustomerId, CreatedAt, UpdatedAt)
   - cart_items (Id, CartId, ProductId, Quantity, PriceAtAdd, CreatedAt, UpdatedAt)
   - orders (Id, CustomerId, Status, TotalAmount, ShippingAddress, CreatedAt, UpdatedAt)
   - order_items (Id, OrderId, ProductId, DealerId, Quantity, UnitPriceAtPurchase, Subtotal, CreatedAt, UpdatedAt)
3. SEED DATA - CATEGORIES (lines 293-312)
   - 8 Core Categories: Electronics, Clothing, Home & Garden, Books, Sports, Toys, Automotive, Health.
4. SEED DATA - ADMINS (lines 320-328)
   - admin@ecommerce.com / Admin@123 (BCrypt hash)
5. SEED DATA - DEALERS (lines 336-349)
   - dealer1@test.com / Dealer@123 (Alex Tech, AlexTechs Shop, Approved)
6. SEED DATA - CUSTOMERS (lines 357-366)
   - customer1@test.com / Customer@123 (John Buyer)
7. SEED DATA - PRODUCTS & IMAGES (lines 371-559)
   - 500 catalog products + 50 extra products across 8 categories with prices, SKUs, and images.
8. SEED DATA - CARTS & ACTIVE CART ITEMS (lines 564-572)
9. SEED DATA - ORDERS & ORDER ITEMS (lines 577-663)
   - 6 orders spanning all status transitions with randomized approved products and calculated totals.
10. VERIFICATION SCRIPT (lines 669-686)

To execute or re-seed the Supabase cloud database:
psql "host=aws-0-ap-south-1.pooler.supabase.com port=6543 dbname=postgres user=postgres.pqkgfmbnvvrsntoqhhoo password=L8hgSMS$zD-6.2w sslmode=require" -f SQL/master.sql
