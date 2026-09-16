-- ============================================================================
-- MULTI-VENDOR E-COMMERCE PLATFORM - MASTER DATABASE SQL
-- ============================================================================
-- PostgreSQL schema + clean single-dealer & single-customer demo dataset
--
-- INCLUDED CONFIGURATION:
-- 1. Admin, Dealer, and Customer are stored in separate dedicated tables.
-- 2. Exactly 1 Admin: admin@ecommerce.com / Admin@123
-- 3. Exactly 1 Dealer: dealer1@test.com / Dealer@123 (Alex Tech)
-- 4. Exactly 1 Customer: customer1@test.com / Customer@123 (John Buyer)
-- 5. All 550 products & images are assigned to Dealer 1 (Alex Tech).
-- 6. All carts, orders & order items belong to Customer 1 & Dealer 1.
-- ============================================================================

-- ============================================================================
-- 1. DROP EXISTING TABLES
-- ============================================================================

DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS cart_items CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS dealer_profiles CASCADE;
DROP TABLE IF EXISTS customer_profiles CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS dealers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS admins CASCADE;

-- ============================================================================
-- 2. CREATE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Admins
-- ----------------------------------------------------------------------------
CREATE TABLE admins (
    "Id"            UUID PRIMARY KEY,
    "Email"         VARCHAR(256) NOT NULL,
    "PasswordHash"  TEXT NOT NULL,
    "FullName"      VARCHAR(256) NOT NULL,
    "Phone"         VARCHAR(32),
    "AvatarUrl"     TEXT,
    "IsActive"      BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ix_admins_email ON admins ("Email");

-- ----------------------------------------------------------------------------
-- Dealers & Shops Table
-- Stores dealer accounts with mandatory ShopName and owner identity
-- ----------------------------------------------------------------------------
CREATE TABLE dealers (
    "Id"                UUID PRIMARY KEY,
    "Email"             VARCHAR(256) NOT NULL,
    "PasswordHash"      TEXT NOT NULL,
    "FullName"          VARCHAR(256) NOT NULL,
    "Phone"             VARCHAR(32),
    "AvatarUrl"         TEXT,
    "ShopName"          VARCHAR(256) NOT NULL,
    "ShopDescription"   TEXT,
    "ShopCategory"      VARCHAR(128) NOT NULL,
    "Address"           TEXT NOT NULL,
    "LogoUrl"           TEXT,
    "IsApproved"        BOOLEAN NOT NULL DEFAULT FALSE,
    "IsActive"          BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ix_dealers_email ON dealers ("Email");

-- ----------------------------------------------------------------------------
-- Customers
-- ----------------------------------------------------------------------------
CREATE TABLE customers (
    "Id"                UUID PRIMARY KEY,
    "Email"             VARCHAR(256) NOT NULL,
    "PasswordHash"      TEXT NOT NULL,
    "FullName"          VARCHAR(256) NOT NULL,
    "Phone"             VARCHAR(32),
    "AvatarUrl"         TEXT,
    "ShippingAddress"   TEXT,
    "IsActive"          BOOLEAN NOT NULL DEFAULT TRUE,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX ix_customers_email ON customers ("Email");

-- ----------------------------------------------------------------------------
-- Categories
-- ----------------------------------------------------------------------------
CREATE TABLE categories (
    "Id"                UUID PRIMARY KEY,
    "Name"              VARCHAR(128) NOT NULL,
    "Description"       TEXT,
    "ParentCategoryId"  UUID,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT fk_categories_parent
        FOREIGN KEY ("ParentCategoryId")
        REFERENCES categories("Id")
);

CREATE UNIQUE INDEX ix_categories_name ON categories ("Name");

-- ----------------------------------------------------------------------------
-- Products
-- ----------------------------------------------------------------------------
CREATE TABLE products (
    "Id"                UUID PRIMARY KEY,
    "Name"              VARCHAR(256) NOT NULL,
    "Description"       TEXT,
    "Price"             DECIMAL(10,2) NOT NULL,
    "StockQuantity"     INTEGER NOT NULL DEFAULT 0,
    "Sku"               VARCHAR(128),
    "ApprovalStatus"    VARCHAR(32) NOT NULL DEFAULT 'Pending',
    "RejectionReason"   TEXT,
    "PublishedAt"       TIMESTAMPTZ,
    "DealerId"          UUID NOT NULL,
    "CategoryId"        UUID NOT NULL,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_products_dealer
        FOREIGN KEY ("DealerId")
        REFERENCES dealers("Id"),

    CONSTRAINT fk_products_category
        FOREIGN KEY ("CategoryId")
        REFERENCES categories("Id"),

    CONSTRAINT chk_products_price
        CHECK ("Price" >= 0),

    CONSTRAINT chk_products_stock
        CHECK ("StockQuantity" >= 0)
);

CREATE INDEX ix_products_approval_category
    ON products ("ApprovalStatus", "CategoryId");

CREATE INDEX ix_products_dealer
    ON products ("DealerId");

CREATE UNIQUE INDEX ix_products_sku
    ON products ("Sku");

-- ----------------------------------------------------------------------------
-- Product Images
-- ----------------------------------------------------------------------------
CREATE TABLE product_images (
    "Id"            UUID PRIMARY KEY,
    "ImageUrl"      TEXT NOT NULL,
    "DisplayOrder"  INTEGER NOT NULL DEFAULT 0,
    "ProductId"     UUID NOT NULL,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_product_images_product
        FOREIGN KEY ("ProductId")
        REFERENCES products("Id")
        ON DELETE CASCADE
);

CREATE INDEX ix_product_images_product
    ON product_images ("ProductId");

-- ----------------------------------------------------------------------------
-- Carts
-- ----------------------------------------------------------------------------
CREATE TABLE carts (
    "Id"            UUID PRIMARY KEY,
    "CustomerId"    UUID NOT NULL,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_carts_customer
        FOREIGN KEY ("CustomerId")
        REFERENCES customers("Id")
        ON DELETE CASCADE
);

CREATE UNIQUE INDEX ix_carts_customerid
    ON carts ("CustomerId");

-- ----------------------------------------------------------------------------
-- Cart Items
-- ----------------------------------------------------------------------------
CREATE TABLE cart_items (
    "Id"            UUID PRIMARY KEY,
    "CartId"        UUID NOT NULL,
    "ProductId"     UUID NOT NULL,
    "Quantity"      INTEGER NOT NULL DEFAULT 1,
    "PriceAtAdd"    DECIMAL(10,2) NOT NULL,
    "CreatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_cart_items_cart
        FOREIGN KEY ("CartId")
        REFERENCES carts("Id")
        ON DELETE CASCADE,

    CONSTRAINT fk_cart_items_product
        FOREIGN KEY ("ProductId")
        REFERENCES products("Id")
        ON DELETE CASCADE,

    CONSTRAINT chk_cart_items_quantity
        CHECK ("Quantity" > 0),

    CONSTRAINT chk_cart_items_price
        CHECK ("PriceAtAdd" >= 0)
);

CREATE UNIQUE INDEX ix_cart_items_cart_product
    ON cart_items ("CartId", "ProductId");

-- ----------------------------------------------------------------------------
-- Orders
-- ----------------------------------------------------------------------------
CREATE TABLE orders (
    "Id"                UUID PRIMARY KEY,
    "CustomerId"        UUID NOT NULL,
    "Status"            VARCHAR(32) NOT NULL DEFAULT 'Pending',
    "TotalAmount"       DECIMAL(12,2) NOT NULL,
    "ShippingAddress"   TEXT NOT NULL,
    "CreatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"         TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_orders_customer
        FOREIGN KEY ("CustomerId")
        REFERENCES customers("Id"),

    CONSTRAINT chk_orders_total
        CHECK ("TotalAmount" >= 0)
);

CREATE INDEX ix_orders_customer ON orders ("CustomerId");
CREATE INDEX ix_orders_status ON orders ("Status");
CREATE INDEX ix_orders_created ON orders ("CreatedAt");

-- ----------------------------------------------------------------------------
-- Order Items
-- ----------------------------------------------------------------------------
CREATE TABLE order_items (
    "Id"                    UUID PRIMARY KEY,
    "OrderId"               UUID NOT NULL,
    "ProductId"             UUID NOT NULL,
    "DealerId"              UUID NOT NULL,
    "Quantity"              INTEGER NOT NULL,
    "UnitPriceAtPurchase"   DECIMAL(10,2) NOT NULL,
    "Subtotal"              DECIMAL(12,2) NOT NULL,
    "CreatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "UpdatedAt"             TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT fk_order_items_order
        FOREIGN KEY ("OrderId")
        REFERENCES orders("Id")
        ON DELETE CASCADE,

    CONSTRAINT fk_order_items_product
        FOREIGN KEY ("ProductId")
        REFERENCES products("Id"),

    CONSTRAINT fk_order_items_dealer
        FOREIGN KEY ("DealerId")
        REFERENCES dealers("Id"),

    CONSTRAINT chk_order_items_quantity
        CHECK ("Quantity" > 0),

    CONSTRAINT chk_order_items_unit_price
        CHECK ("UnitPriceAtPurchase" >= 0),

    CONSTRAINT chk_order_items_subtotal
        CHECK ("Subtotal" >= 0)
);

CREATE INDEX ix_order_items_order ON order_items ("OrderId");
CREATE INDEX ix_order_items_dealer ON order_items ("DealerId");

-- ============================================================================
-- 3. SEED DATA - CATEGORIES
-- ============================================================================

INSERT INTO categories
    ("Id", "Name", "Description", "CreatedAt", "UpdatedAt")
VALUES
    ('a1000000-0000-0000-0000-000000000001', 'Electronics',
     'Electronic devices and accessories', NOW(), NOW()),
    ('a1000000-0000-0000-0000-000000000002', 'Clothing',
     'Fashion and apparel', NOW(), NOW()),
    ('a1000000-0000-0000-0000-000000000003', 'Home & Garden',
     'Home improvement and garden supplies', NOW(), NOW()),
    ('a1000000-0000-0000-0000-000000000004', 'Books',
     'Books and educational materials', NOW(), NOW()),
    ('a1000000-0000-0000-0000-000000000005', 'Sports',
     'Sports equipment and accessories', NOW(), NOW()),
    ('a1000000-0000-0000-0000-000000000006', 'Toys',
     'Toys and games for all ages', NOW(), NOW()),
    ('a1000000-0000-0000-0000-000000000007', 'Automotive',
     'Car parts and accessories', NOW(), NOW()),
    ('a1000000-0000-0000-0000-000000000008', 'Health',
     'Health and wellness products', NOW(), NOW());

-- ============================================================================
-- 4. SEED DATA - ADMINS
-- ============================================================================

-- Password: Admin@123
-- BCrypt cost factor: 11

INSERT INTO admins
    ("Id", "Email", "PasswordHash", "FullName", "Phone",
     "IsActive", "CreatedAt", "UpdatedAt")
VALUES
    ('b1000000-0000-0000-0000-000000000001',
     'admin@ecommerce.com',
     '$2a$11$S2ZoaWf3hknWcI/Og0uzg.vHxucE3fJcbHU91qFAH/p.tYRX4heWy',
     'System Admin', '+1000000000', TRUE, NOW(), NOW());

-- ============================================================================
-- 5. SEED DATA - DEALERS (Single Dealer)
-- ============================================================================

-- Password: Dealer@123
-- BCrypt cost factor: 11

INSERT INTO dealers
    ("Id", "Email", "PasswordHash", "FullName", "Phone",
     "ShopName", "ShopDescription", "ShopCategory", "Address",
     "IsApproved", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
    ('c2000000-0000-0000-0000-000000000001',
     'dealer1@test.com',
     '$2a$11$Lx9F4rmuo3l6ujspZS4w4OLWOjfwrsgpzVB2vcXvrGwAYdqAO795q',
     'Alex Tech', '+1000001001',
     'AlexTechs Shop',
     'Leading electronics retailer with the latest gadgets',
     'Electronics', '456 Commerce Ave, Business District',
     TRUE, TRUE, NOW(), NOW());

-- ============================================================================
-- 6. SEED DATA - CUSTOMERS (Single Customer)
-- ============================================================================

-- Password: Customer@123
-- BCrypt cost factor: 11

INSERT INTO customers
    ("Id", "Email", "PasswordHash", "FullName", "Phone",
     "ShippingAddress", "IsActive", "CreatedAt", "UpdatedAt")
VALUES
    ('c3000000-0000-0000-0000-000000000001',
     'customer1@test.com',
     '$2a$11$IYBD96EyES3aYh5pEcMqkOAHFt.2boQuF4TnQrLgxB3hj7KI1K2te',
     'John Buyer', '+1000002001',
     '123 Demo Street, Demo City, Country', TRUE, NOW(), NOW());

-- ============================================================================
-- 7. SEED DATA - PRODUCTS (500 Products assigned to Dealer 1)
-- ============================================================================

DO $$
DECLARE
    dealer RECORD;
    cat_ids UUID[] := ARRAY[
        'a1000000-0000-0000-0000-000000000001'::uuid,
        'a1000000-0000-0000-0000-000000000002'::uuid,
        'a1000000-0000-0000-0000-000000000003'::uuid,
        'a1000000-0000-0000-0000-000000000004'::uuid,
        'a1000000-0000-0000-0000-000000000005'::uuid,
        'a1000000-0000-0000-0000-000000000006'::uuid,
        'a1000000-0000-0000-0000-000000000007'::uuid,
        'a1000000-0000-0000-0000-000000000008'::uuid
    ];
    product_names TEXT[] := ARRAY[
        'Wireless Bluetooth Headphones',
        'Smart Watch Pro',
        'Laptop Stand Adjustable',
        'USB-C Hub Multiport',
        'Mechanical Keyboard RGB',
        'Gaming Mouse Wireless',
        'Portable Charger 20000mAh',
        'Webcam HD 1080p',
        'Monitor Light Bar',
        'Desk Organizer Set'
    ];
    descriptions TEXT[] := ARRAY[
        'High-quality product with premium build quality',
        'Best seller in its category with excellent reviews',
        'Affordable yet durable for everyday use',
        'Professional grade for serious users',
        'Perfect gift for friends and family'
    ];
    statuses TEXT[] := ARRAY[
        'Approved', 'Approved', 'Approved', 'Pending', 'Rejected'
    ];
    j INT;
    cat_idx INT;
    status_idx INT;
    price DECIMAL;
    stock INT;
    prod_id UUID;
    dealer_prefix TEXT;
BEGIN
    FOR dealer IN SELECT "Id", "ShopName" FROM dealers LOOP
        dealer_prefix := UPPER(SUBSTRING(dealer."ShopName" FROM 1 FOR 4));

        FOR j IN 0..499 LOOP
            prod_id := gen_random_uuid();
            cat_idx := (j % 8) + 1;
            status_idx := (j % 5) + 1;
            price := ROUND((5 + (random() * 495))::numeric, 2);
            stock := (random() * 199)::int;

            INSERT INTO products (
                "Id", "Name", "Description", "Price", "StockQuantity", "Sku",
                "ApprovalStatus", "RejectionReason", "PublishedAt",
                "DealerId", "CategoryId", "CreatedAt", "UpdatedAt"
            )
            VALUES (
                prod_id,
                dealer."ShopName" || ' - ' ||
                    product_names[(j % 10) + 1] || ' #' || (j + 1),
                descriptions[(j % 5) + 1],
                price,
                stock,
                'SKU-' || dealer_prefix || '-' || LPAD((j + 1)::text, 3, '0'),
                statuses[status_idx],
                CASE
                    WHEN statuses[status_idx] = 'Rejected'
                    THEN 'Does not meet quality standards'
                    ELSE NULL
                END,
                CASE
                    WHEN statuses[status_idx] = 'Approved'
                    THEN NOW() - (random() * interval '60 days')
                    ELSE NULL
                END,
                dealer."Id",
                cat_ids[cat_idx],
                NOW(),
                NOW()
            );

            INSERT INTO product_images (
                "Id", "ImageUrl", "DisplayOrder",
                "ProductId", "CreatedAt", "UpdatedAt"
            )
            VALUES (
                gen_random_uuid(),
                'https://picsum.photos/seed/' ||
                    SUBSTRING(prod_id::text FROM 1 FOR 8) || '/400/400',
                0,
                prod_id,
                NOW(),
                NOW()
            );
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 8. ADDITIONAL 50 PRODUCTS (Assigned to Dealer 1)
-- ============================================================================

DO $$
DECLARE
    dealer RECORD;
    cat_ids UUID[] := ARRAY[
        'a1000000-0000-0000-0000-000000000001'::uuid,
        'a1000000-0000-0000-0000-000000000002'::uuid,
        'a1000000-0000-0000-0000-000000000003'::uuid,
        'a1000000-0000-0000-0000-000000000004'::uuid,
        'a1000000-0000-0000-0000-000000000005'::uuid,
        'a1000000-0000-0000-0000-000000000006'::uuid,
        'a1000000-0000-0000-0000-000000000007'::uuid,
        'a1000000-0000-0000-0000-000000000008'::uuid
    ];
    extra_products TEXT[] := ARRAY[
        'Premium USB-C Cable 2m',
        'Wireless Charging Pad',
        'Portable Bluetooth Speaker',
        'Smart LED Desk Lamp',
        'Foldable Travel Backpack'
    ];
    extra_descriptions TEXT[] := ARRAY[
        'Reliable everyday product with durable construction',
        'Modern design with practical features',
        'Compact and convenient for daily use',
        'Premium quality at an affordable price',
        'Popular choice for home, office and travel'
    ];
    statuses TEXT[] := ARRAY[
        'Approved', 'Approved', 'Approved', 'Pending', 'Approved'
    ];
    j INT;
    price DECIMAL;
    stock INT;
    prod_id UUID;
    dealer_prefix TEXT;
BEGIN
    FOR dealer IN SELECT "Id", "ShopName" FROM dealers LOOP
        dealer_prefix := UPPER(SUBSTRING(dealer."ShopName" FROM 1 FOR 4));

        FOR j IN 0..49 LOOP
            prod_id := gen_random_uuid();
            price := ROUND((15 + (random() * 285))::numeric, 2);
            stock := 20 + (random() * 180)::int;

            INSERT INTO products (
                "Id", "Name", "Description", "Price", "StockQuantity", "Sku",
                "ApprovalStatus", "RejectionReason", "PublishedAt",
                "DealerId", "CategoryId", "CreatedAt", "UpdatedAt"
            )
            VALUES (
                prod_id,
                dealer."ShopName" || ' - ' || extra_products[(j % 5) + 1] || ' Extra #' || (j + 1),
                extra_descriptions[(j % 5) + 1],
                price,
                stock,
                'SKU-' || dealer_prefix || '-EX-' || LPAD((j + 1)::text, 3, '0'),
                statuses[(j % 5) + 1],
                NULL,
                CASE
                    WHEN statuses[(j % 5) + 1] = 'Approved'
                    THEN NOW() - (random() * interval '30 days')
                    ELSE NULL
                END,
                dealer."Id",
                cat_ids[((j + 2) % 8) + 1],
                NOW(),
                NOW()
            );

            INSERT INTO product_images (
                "Id", "ImageUrl", "DisplayOrder",
                "ProductId", "CreatedAt", "UpdatedAt"
            )
            VALUES (
                gen_random_uuid(),
                'https://picsum.photos/seed/' ||
                    SUBSTRING(prod_id::text FROM 1 FOR 8) || '/400/400',
                0,
                prod_id,
                NOW(),
                NOW()
            );
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 9. SEED DATA - CARTS
-- ============================================================================

INSERT INTO carts ("Id", "CustomerId", "CreatedAt", "UpdatedAt")
SELECT
    'd3000000-0000-0000-0000-000000000001'::uuid,
    "Id",
    NOW(),
    NOW()
FROM customers;

-- ============================================================================
-- 10. SEED DATA - ORDERS
-- ============================================================================

DO $$
DECLARE
    cust RECORD;
    order_id UUID;
    order_count INT := 6;
    o INT;
    item_prod RECORD;
    order_status TEXT;
    total DECIMAL;
    subtotal DECIMAL;
    item_qty INT;
BEGIN
    FOR cust IN SELECT "Id", "ShippingAddress" FROM customers LOOP
        FOR o IN 1..order_count LOOP
            order_id := gen_random_uuid();

            order_status :=
                (ARRAY[
                    'Pending',
                    'Confirmed',
                    'Processing',
                    'Shipped',
                    'Delivered',
                    'Cancelled'
                ])[o];

            INSERT INTO orders (
                "Id", "CustomerId", "Status",
                "TotalAmount", "ShippingAddress",
                "CreatedAt", "UpdatedAt"
            )
            VALUES (
                order_id,
                cust."Id",
                order_status,
                0,
                COALESCE(
                    cust."ShippingAddress",
                    '123 Demo Street, Demo City, Country'
                ),
                NOW() - (o * interval '1 day'),
                NOW()
            );

            total := 0;

            FOR item_prod IN
                SELECT p."Id", p."Price", p."DealerId"
                FROM products p
                WHERE p."ApprovalStatus" = 'Approved'
                ORDER BY RANDOM()
                LIMIT (1 + (random() * 3)::int)
            LOOP
                item_qty := 1 + (random() * 2)::int;
                subtotal := ROUND(
                    item_prod."Price" * item_qty,
                    2
                );

                total := total + subtotal;

                INSERT INTO order_items (
                    "Id", "OrderId", "ProductId", "DealerId",
                    "Quantity", "UnitPriceAtPurchase", "Subtotal",
                    "CreatedAt", "UpdatedAt"
                )
                VALUES (
                    gen_random_uuid(),
                    order_id,
                    item_prod."Id",
                    item_prod."DealerId",
                    item_qty,
                    item_prod."Price",
                    subtotal,
                    NOW(),
                    NOW()
                );
            END LOOP;

            UPDATE orders
            SET
                "TotalAmount" = total,
                "UpdatedAt" = NOW()
            WHERE "Id" = order_id;
        END LOOP;
    END LOOP;
END $$;

-- ============================================================================
-- 11. VERIFY DATABASE
-- ============================================================================

SELECT 'Admins' AS table_name, COUNT(*) AS count FROM admins
UNION ALL
SELECT 'Dealers', COUNT(*) FROM dealers
UNION ALL
SELECT 'Customers', COUNT(*) FROM customers
UNION ALL
SELECT 'Categories', COUNT(*) FROM categories
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Product Images', COUNT(*) FROM product_images
UNION ALL
SELECT 'Carts', COUNT(*) FROM carts
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'Order Items', COUNT(*) FROM order_items
ORDER BY table_name;

-- ============================================================================
-- MASTER DEMO CREDENTIALS
-- ============================================================================
-- Admin:    admin@ecommerce.com / Admin@123
-- Dealer:   dealer1@test.com    / Dealer@123 (Alex Tech)
-- Customer: customer1@test.com  / Customer@123 (John Buyer)
-- ============================================================================
