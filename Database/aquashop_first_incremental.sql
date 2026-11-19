
-- ============================================================================
--  AquaShop — SQL Server database
--  Generated for the Angular 18 AquaShop storefront + admin panel.
--
--  CONNECTION STRING (put this in appsettings.json / ConnectionStrings:Default):
--    Local SQL Server : Server=localhost;Database=AquaShop;Trusted_Connection=True;TrustServerCertificate=True
--    SQL Server Express: Server=.\SQLEXPRESS;Database=AquaShop;Trusted_Connection=True;TrustServerCertificate=True
--    LocalDB         : Server=(localdb)\MSSQLLocalDB;Database=AquaShop;Trusted_Connection=True
--    Docker          : Server=localhost,1433;Database=AquaShop;User Id=sa;Password=Your_strong_Password1;TrustServerCertificate=True
--
--  Run the whole file in SSMS / Azure Data Studio. Safe to re-run: the seed
--  blocks only insert when their table is empty.
-- ============================================================================

SET NOCOUNT ON;
GO

IF NOT EXISTS (SELECT 1 FROM sys.databases WHERE name = N'AquaShop')
BEGIN
    CREATE DATABASE AquaShop;
END
GO

USE AquaShop;
GO

-- ── Identity & RBAC ─────────────────────────────────────────────────────────

CREATE TABLE dbo.roles (
    id          INT IDENTITY(1,1) NOT NULL,
    name        NVARCHAR(50)  NOT NULL,
    description NVARCHAR(255) NULL,
    is_system   BIT           NOT NULL DEFAULT 0,
    created_at  DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_roles PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_roles_name UNIQUE (name)
);

CREATE TABLE dbo.permissions (
    id          INT IDENTITY(1,1) NOT NULL,
    code        NVARCHAR(100) NOT NULL,          -- e.g. 'products.create'
    name        NVARCHAR(120) NOT NULL,
    module      NVARCHAR(50)  NOT NULL,
    description NVARCHAR(255) NULL,
    CONSTRAINT PK_permissions PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_permissions_code UNIQUE (code)
);

CREATE TABLE dbo.role_permissions (
    role_id       INT       NOT NULL,
    permission_id INT       NOT NULL,
    granted_at    DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_role_permissions PRIMARY KEY CLUSTERED (role_id, permission_id),
    CONSTRAINT FK_role_permissions_role FOREIGN KEY (role_id)       REFERENCES dbo.roles(id)       ON DELETE CASCADE,
    CONSTRAINT FK_role_permissions_perm FOREIGN KEY (permission_id) REFERENCES dbo.permissions(id) ON DELETE CASCADE
);

CREATE TABLE dbo.users (
    id             UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID(),
    email          NVARCHAR(256) NOT NULL,
    password_hash  NVARCHAR(256) NOT NULL,       -- SHA-256 hex in this demo; use ASP.NET Identity / PBKDF2 in production
    first_name     NVARCHAR(80)  NOT NULL,
    last_name      NVARCHAR(80)  NOT NULL,
    phone          NVARCHAR(40)  NULL,
    avatar         NVARCHAR(500) NULL,
    status         NVARCHAR(20)  NOT NULL DEFAULT 'Active',
    email_confirmed BIT          NOT NULL DEFAULT 1,
    created_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at     DATETIME2     NULL,
    last_login_at  DATETIME2     NULL,
    CONSTRAINT PK_users PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_users_email UNIQUE (email),
    CONSTRAINT CHK_users_status CHECK (status IN ('Active','Inactive'))
);

CREATE TABLE dbo.user_roles (
    user_id      UNIQUEIDENTIFIER NOT NULL,
    role_id      INT              NOT NULL,
    assigned_at  DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_user_roles PRIMARY KEY CLUSTERED (user_id, role_id),
    CONSTRAINT FK_user_roles_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)  ON DELETE CASCADE,
    CONSTRAINT FK_user_roles_role FOREIGN KEY (role_id) REFERENCES dbo.roles(id)  ON DELETE CASCADE
);

-- Admin pages are data-driven: a page is reachable only when the user's role
-- grants the permission code the page points at.
CREATE TABLE dbo.pages (
    id              INT IDENTITY(1,1) NOT NULL,
    name            NVARCHAR(80)  NOT NULL,
    route           NVARCHAR(120) NOT NULL,
    permission_code NVARCHAR(100) NOT NULL,
    icon            NVARCHAR(60)  NULL,
    display_order   INT          NOT NULL DEFAULT 0,
    is_active       BIT          NOT NULL DEFAULT 1,
    CONSTRAINT PK_pages PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_pages_route UNIQUE (route),
    CONSTRAINT FK_pages_permission FOREIGN KEY (permission_code) REFERENCES dbo.permissions(code)
);

-- ── Catalog ─────────────────────────────────────────────────────────────────

CREATE TABLE dbo.categories (
    id            NVARCHAR(50)  NOT NULL,
    name          NVARCHAR(120) NOT NULL,
    slug          NVARCHAR(140) NOT NULL,
    description   NVARCHAR(500) NULL,
    image         NVARCHAR(500) NULL,
    parent_id     NVARCHAR(50)  NULL,
    display_order INT           NOT NULL DEFAULT 0,
    is_featured   BIT           NOT NULL DEFAULT 0,
    is_active     BIT           NOT NULL DEFAULT 1,
    CONSTRAINT PK_categories PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_categories_slug UNIQUE (slug),
    CONSTRAINT FK_categories_parent FOREIGN KEY (parent_id) REFERENCES dbo.categories(id)
);

CREATE TABLE dbo.products (
    id               NVARCHAR(50)  NOT NULL,
    sku              NVARCHAR(60)  NOT NULL,
    slug             NVARCHAR(160) NOT NULL,
    name             NVARCHAR(160) NOT NULL,
    category_id      NVARCHAR(50)  NOT NULL,
    subcategory_id   NVARCHAR(50)  NULL,
    brand            NVARCHAR(80)  NOT NULL,
    short_description NVARCHAR(500) NULL,
    description      NVARCHAR(MAX) NULL,
    price            DECIMAL(10,2) NOT NULL,
    sale_price       DECIMAL(10,2) NULL,
    cost_price       DECIMAL(10,2) NULL,
    currency         NVARCHAR(3)   NOT NULL DEFAULT 'NPR',
    stock_quantity   INT           NOT NULL DEFAULT 0,
    minimum_stock    INT           NOT NULL DEFAULT 0,
    track_inventory  BIT           NOT NULL DEFAULT 1,
    allow_backorders BIT           NOT NULL DEFAULT 0,
    rating_average   DECIMAL(3,2)  NOT NULL DEFAULT 0,
    rating_count     INT           NOT NULL DEFAULT 0,
    is_active        BIT           NOT NULL DEFAULT 1,
    is_featured      BIT           NOT NULL DEFAULT 0,
    created_at       DATE          NOT NULL,
    meta_title       NVARCHAR(200) NULL,
    meta_description NVARCHAR(400) NULL,
    CONSTRAINT PK_products PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_products_sku  UNIQUE (sku),
    CONSTRAINT UQ_products_slug UNIQUE (slug),
    CONSTRAINT FK_products_category    FOREIGN KEY (category_id)    REFERENCES dbo.categories(id),
    CONSTRAINT FK_products_subcategory FOREIGN KEY (subcategory_id) REFERENCES dbo.categories(id),
    CONSTRAINT CHK_products_price CHECK (price >= 0)
);

CREATE TABLE dbo.product_images (
    product_id NVARCHAR(50)  NOT NULL,
    url        NVARCHAR(500) NOT NULL,
    sort_order INT           NOT NULL DEFAULT 0,
    CONSTRAINT PK_product_images PRIMARY KEY CLUSTERED (product_id, sort_order),
    CONSTRAINT FK_product_images_product FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE
);

CREATE TABLE dbo.product_tags (
    product_id NVARCHAR(50) NOT NULL,
    tag        NVARCHAR(60) NOT NULL,
    CONSTRAINT PK_product_tags PRIMARY KEY CLUSTERED (product_id, tag),
    CONSTRAINT FK_product_tags_product FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE
);

CREATE TABLE dbo.product_badges (
    product_id NVARCHAR(50) NOT NULL,
    badge      NVARCHAR(40) NOT NULL,
    CONSTRAINT PK_product_badges PRIMARY KEY CLUSTERED (product_id, badge),
    CONSTRAINT FK_product_badges_product FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE
);

CREATE TABLE dbo.product_attributes (
    id             INT IDENTITY(1,1) NOT NULL,
    product_id     NVARCHAR(50)  NOT NULL,
    attribute_type NVARCHAR(20)  NOT NULL,     -- 'attribute' | 'specification'
    label          NVARCHAR(120) NOT NULL,
    value          NVARCHAR(255) NOT NULL,
    sort_order     INT           NOT NULL DEFAULT 0,
    CONSTRAINT PK_product_attributes PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_product_attributes_product FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE,
    CONSTRAINT CHK_product_attributes_type CHECK (attribute_type IN ('attribute','specification'))
);

-- ── Customers, addresses, cart, wishlist ────────────────────────────────────

CREATE TABLE dbo.customers (
    id            NVARCHAR(50)  NOT NULL,
    user_id       UNIQUEIDENTIFIER NULL,
    first_name    NVARCHAR(80)  NOT NULL,
    last_name     NVARCHAR(80)  NOT NULL,
    email         NVARCHAR(256) NOT NULL,
    phone         NVARCHAR(40)  NULL,
    status        NVARCHAR(20)  NOT NULL DEFAULT 'Active',
    registered_at DATE          NOT NULL,
    CONSTRAINT PK_customers PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_customers_email UNIQUE (email),
    CONSTRAINT FK_customers_user FOREIGN KEY (user_id) REFERENCES dbo.users(id),
    CONSTRAINT CHK_customers_status CHECK (status IN ('Active','Inactive'))
);

CREATE TABLE dbo.addresses (
    id           INT IDENTITY(1,1) NOT NULL,
    customer_id  NVARCHAR(50)  NOT NULL,
    full_name    NVARCHAR(120) NOT NULL,
    phone        NVARCHAR(40)  NULL,
    address_line NVARCHAR(200) NOT NULL,
    city         NVARCHAR(80)  NOT NULL,
    state        NVARCHAR(80)  NULL,
    country      NVARCHAR(80)  NOT NULL,
    postal_code  NVARCHAR(20)  NULL,
    is_default   BIT           NOT NULL DEFAULT 0,
    CONSTRAINT PK_addresses PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_addresses_customer FOREIGN KEY (customer_id) REFERENCES dbo.customers(id) ON DELETE CASCADE
);

CREATE TABLE dbo.cart_items (
    id           INT IDENTITY(1,1) NOT NULL,
    user_id      UNIQUEIDENTIFIER NULL,
    session_id   NVARCHAR(120) NULL,
    product_id   NVARCHAR(50)  NOT NULL,
    sku          NVARCHAR(60)  NULL,
    name         NVARCHAR(160) NULL,
    image        NVARCHAR(500) NULL,
    unit_price   DECIMAL(10,2) NOT NULL,
    quantity     INT           NOT NULL DEFAULT 1,
    max_quantity INT           NOT NULL DEFAULT 99,
    added_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_cart_items PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_cart_items_product FOREIGN KEY (product_id) REFERENCES dbo.products(id),
    CONSTRAINT FK_cart_items_user   FOREIGN KEY (user_id)   REFERENCES dbo.users(id) ON DELETE CASCADE,
    CONSTRAINT CHK_cart_items_qty   CHECK (quantity > 0)
);

CREATE TABLE dbo.wishlist_items (
    user_id    UNIQUEIDENTIFIER NOT NULL,
    product_id NVARCHAR(50)     NOT NULL,
    added_at   DATETIME2        NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_wishlist_items PRIMARY KEY CLUSTERED (user_id, product_id),
    CONSTRAINT FK_wishlist_user    FOREIGN KEY (user_id)    REFERENCES dbo.users(id)    ON DELETE CASCADE,
    CONSTRAINT FK_wishlist_product FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE
);

-- ── Orders ──────────────────────────────────────────────────────────────────

CREATE TABLE dbo.orders (
    id                 NVARCHAR(50)  NOT NULL,
    order_number       NVARCHAR(20)  NOT NULL,
    customer_id        NVARCHAR(50)  NULL,
    customer_name      NVARCHAR(120) NOT NULL,
    customer_email     NVARCHAR(256) NULL,
    status             NVARCHAR(20)  NOT NULL DEFAULT 'Pending',
    payment_status     NVARCHAR(20)  NOT NULL DEFAULT 'Unpaid',
    payment_method     NVARCHAR(40)  NULL,
    delivery_method    NVARCHAR(40)  NULL,
    subtotal           DECIMAL(10,2) NOT NULL DEFAULT 0,
    discount           DECIMAL(10,2) NOT NULL DEFAULT 0,
    shipping_fee       DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax                DECIMAL(10,2) NOT NULL DEFAULT 0,
    grand_total        DECIMAL(10,2) NOT NULL DEFAULT 0,
    coupon_code        NVARCHAR(50)  NULL,
    billing_address_id INT           NULL,
    shipping_address_id INT          NULL,
    placed_at          DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    estimated_delivery DATE          NULL,
    cancelled_at       DATETIME2     NULL,
    notes              NVARCHAR(500) NULL,
    CONSTRAINT PK_orders PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_orders_number UNIQUE (order_number),
    CONSTRAINT FK_orders_customer FOREIGN KEY (customer_id) REFERENCES dbo.customers(id),
    CONSTRAINT FK_orders_billing  FOREIGN KEY (billing_address_id)  REFERENCES dbo.addresses(id),
    CONSTRAINT FK_orders_shipping FOREIGN KEY (shipping_address_id) REFERENCES dbo.addresses(id),
    CONSTRAINT CHK_orders_status  CHECK (status IN ('Pending','Confirmed','Processing','Packed','Shipped','Delivered','Cancelled')),
    CONSTRAINT CHK_orders_payment CHECK (payment_status IN ('Unpaid','Paid','Refunded'))
);

CREATE TABLE dbo.order_items (
    id         INT IDENTITY(1,1) NOT NULL,
    order_id   NVARCHAR(50)  NOT NULL,
    product_id NVARCHAR(50)  NULL,
    sku        NVARCHAR(60)  NULL,
    name       NVARCHAR(160) NOT NULL,
    image      NVARCHAR(500) NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    quantity   INT           NOT NULL,
    line_total DECIMAL(10,2) NOT NULL,
    CONSTRAINT PK_order_items PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_order_items_order   FOREIGN KEY (order_id)   REFERENCES dbo.orders(id)   ON DELETE CASCADE,
    CONSTRAINT FK_order_items_product FOREIGN KEY (product_id) REFERENCES dbo.products(id)
);

CREATE TABLE dbo.order_status_history (
    id         INT IDENTITY(1,1) NOT NULL,
    order_id   NVARCHAR(50) NOT NULL,
    status     NVARCHAR(20) NOT NULL,
    changed_by UNIQUEIDENTIFIER NULL,
    note       NVARCHAR(255) NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_order_status_history PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_order_history_order FOREIGN KEY (order_id)   REFERENCES dbo.orders(id) ON DELETE CASCADE,
    CONSTRAINT FK_order_history_user  FOREIGN KEY (changed_by) REFERENCES dbo.users(id)
);

-- ── Marketing: banners, offers ──────────────────────────────────────────────

CREATE TABLE dbo.banners (
    id            NVARCHAR(50)  NOT NULL,
    title         NVARCHAR(160) NOT NULL,
    subtitle      NVARCHAR(160) NULL,
    description   NVARCHAR(500) NULL,
    image         NVARCHAR(500) NULL,
    button_text   NVARCHAR(60)  NULL,
    button_link   NVARCHAR(200) NULL,
    start_date    DATE          NULL,
    end_date      DATE          NULL,
    active        BIT           NOT NULL DEFAULT 1,
    display_order INT           NOT NULL DEFAULT 0,
    CONSTRAINT PK_banners PRIMARY KEY CLUSTERED (id)
);

CREATE TABLE dbo.offers (
    id               NVARCHAR(50)  NOT NULL,
    title            NVARCHAR(160) NOT NULL,
    description      NVARCHAR(500) NULL,
    type             NVARCHAR(20)  NOT NULL,
    discount_percent DECIMAL(5,2)  NOT NULL,
    coupon_code      NVARCHAR(50)  NULL,
    start_date       DATE          NULL,
    end_date         DATE          NULL,
    active           BIT           NOT NULL DEFAULT 1,
    display_order    INT           NOT NULL DEFAULT 0,
    CONSTRAINT PK_offers PRIMARY KEY CLUSTERED (id),
    CONSTRAINT CHK_offers_type CHECK (type IN ('flash-sale','seasonal','bundle','coupon'))
);

CREATE TABLE dbo.offer_products (
    offer_id   NVARCHAR(50) NOT NULL,
    product_id NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_offer_products PRIMARY KEY CLUSTERED (offer_id, product_id),
    CONSTRAINT FK_offer_products_offer   FOREIGN KEY (offer_id)   REFERENCES dbo.offers(id)   ON DELETE CASCADE,
    CONSTRAINT FK_offer_products_product FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE
);

CREATE TABLE dbo.offer_categories (
    offer_id    NVARCHAR(50) NOT NULL,
    category_id NVARCHAR(50) NOT NULL,
    CONSTRAINT PK_offer_categories PRIMARY KEY CLUSTERED (offer_id, category_id),
    CONSTRAINT FK_offer_categories_offer    FOREIGN KEY (offer_id)    REFERENCES dbo.offers(id)      ON DELETE CASCADE,
    CONSTRAINT FK_offer_categories_category FOREIGN KEY (category_id) REFERENCES dbo.categories(id) ON DELETE CASCADE
);

-- ── Content: blog, reviews, homepage, settings ──────────────────────────────

CREATE TABLE dbo.blog_posts (
    id             NVARCHAR(50)  NOT NULL,
    title          NVARCHAR(200) NOT NULL,
    slug           NVARCHAR(220) NOT NULL,
    description    NVARCHAR(500) NULL,
    content        NVARCHAR(MAX) NULL,
    image          NVARCHAR(500) NULL,
    category       NVARCHAR(80)  NULL,
    author         NVARCHAR(120) NULL,
    status         NVARCHAR(20)  NOT NULL DEFAULT 'Draft',
    published_date DATE          NULL,
    created_at     DATETIME2     NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at     DATETIME2     NULL,
    CONSTRAINT PK_blog_posts PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_blog_posts_slug UNIQUE (slug),
    CONSTRAINT CHK_blog_posts_status CHECK (status IN ('Published','Draft'))
);

CREATE TABLE dbo.blog_post_tags (
    post_id NVARCHAR(50) NOT NULL,
    tag     NVARCHAR(60) NOT NULL,
    CONSTRAINT PK_blog_post_tags PRIMARY KEY CLUSTERED (post_id, tag),
    CONSTRAINT FK_blog_post_tags_post FOREIGN KEY (post_id) REFERENCES dbo.blog_posts(id) ON DELETE CASCADE
);

CREATE TABLE dbo.reviews (
    id               NVARCHAR(50)  NOT NULL,
    product_id       NVARCHAR(50)  NOT NULL,
    customer_id      NVARCHAR(50)  NULL,
    customer_name    NVARCHAR(120) NOT NULL,
    avatar           NVARCHAR(500) NULL,
    rating           INT           NOT NULL,
    title            NVARCHAR(160) NULL,
    comment          NVARCHAR(1000) NULL,
    verified_purchase BIT          NOT NULL DEFAULT 0,
    status           NVARCHAR(20)  NOT NULL DEFAULT 'Approved',
    created_at       DATE          NOT NULL,
    CONSTRAINT PK_reviews PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_reviews_product  FOREIGN KEY (product_id)  REFERENCES dbo.products(id)  ON DELETE CASCADE,
    CONSTRAINT FK_reviews_customer FOREIGN KEY (customer_id) REFERENCES dbo.customers(id),
    CONSTRAINT CHK_reviews_rating  CHECK (rating BETWEEN 1 AND 5),
    CONSTRAINT CHK_reviews_status  CHECK (status IN ('Pending','Approved','Rejected'))
);

CREATE TABLE dbo.homepage_sections (
    id            NVARCHAR(50)  NOT NULL,
    type          NVARCHAR(40)  NOT NULL,
    title         NVARCHAR(160) NULL,
    subtitle      NVARCHAR(200) NULL,
    enabled       BIT           NOT NULL DEFAULT 1,
    display_order INT           NOT NULL DEFAULT 0,
    CONSTRAINT PK_homepage_sections PRIMARY KEY CLUSTERED (id),
    CONSTRAINT UQ_homepage_sections_type UNIQUE (type)
);

CREATE TABLE dbo.settings (
    setting_key   NVARCHAR(100) NOT NULL,
    setting_value NVARCHAR(MAX) NULL,
    description   NVARCHAR(255) NULL,
    updated_at    DATETIME2     NULL,
    CONSTRAINT PK_settings PRIMARY KEY CLUSTERED (setting_key)
);

CREATE TABLE dbo.inventory_log (
    id             INT IDENTITY(1,1) NOT NULL,
    product_id     NVARCHAR(50) NOT NULL,
    change_quantity INT          NOT NULL,
    new_quantity   INT          NOT NULL,
    reason         NVARCHAR(255) NULL,
    user_id        UNIQUEIDENTIFIER NULL,
    created_at     DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_inventory_log PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_inventory_log_product FOREIGN KEY (product_id) REFERENCES dbo.products(id) ON DELETE CASCADE,
    CONSTRAINT FK_inventory_log_user   FOREIGN KEY (user_id)   REFERENCES dbo.users(id)
);

CREATE TABLE dbo.audit_logs (
    id         BIGINT IDENTITY(1,1) NOT NULL,
    user_id    UNIQUEIDENTIFIER NULL,
    action     NVARCHAR(100) NOT NULL,
    entity     NVARCHAR(100) NULL,
    entity_id  NVARCHAR(100) NULL,
    details    NVARCHAR(MAX) NULL,
    ip_address NVARCHAR(50)  NULL,
    created_at DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    CONSTRAINT PK_audit_logs PRIMARY KEY CLUSTERED (id),
    CONSTRAINT FK_audit_logs_user FOREIGN KEY (user_id) REFERENCES dbo.users(id)
);

-- ── Indexes ─────────────────────────────────────────────────────────────────

CREATE NONCLUSTERED INDEX IX_products_category     ON dbo.products(category_id);
CREATE NONCLUSTERED INDEX IX_products_subcategory  ON dbo.products(subcategory_id);
CREATE NONCLUSTERED INDEX IX_products_active        ON dbo.products(is_active) INCLUDE (name, slug, price, sale_price, stock_quantity);
CREATE NONCLUSTERED INDEX IX_products_featured     ON dbo.products(is_featured) WHERE is_featured = 1;
CREATE NONCLUSTERED INDEX IX_orders_customer       ON dbo.orders(customer_id);
CREATE NONCLUSTERED INDEX IX_orders_status         ON dbo.orders(status);
CREATE NONCLUSTERED INDEX IX_orders_placed_at      ON dbo.orders(placed_at DESC);
CREATE NONCLUSTERED INDEX IX_order_items_order     ON dbo.order_items(order_id);
CREATE NONCLUSTERED INDEX IX_reviews_product       ON dbo.reviews(product_id);
CREATE NONCLUSTERED INDEX IX_inventory_log_product ON dbo.inventory_log(product_id);
CREATE NONCLUSTERED INDEX IX_audit_logs_user       ON dbo.audit_logs(user_id, created_at DESC);
CREATE NONCLUSTERED INDEX IX_cart_items_user       ON dbo.cart_items(user_id);
CREATE NONCLUSTERED INDEX IX_cart_items_session    ON dbo.cart_items(session_id);
CREATE NONCLUSTERED INDEX IX_customers_user        ON dbo.customers(user_id);

IF NOT EXISTS (SELECT 1 FROM dbo.roles)
BEGIN
INSERT INTO dbo.roles (name, description, is_system)
VALUES
    (N'Administrator', N'Full access to every module, including users, roles and settings.', 1),
    (N'Manager', N'Runs the catalog, inventory, orders and content. No user/role management.', 0),
    (N'Support', N'Handles orders, customers and review moderation.', 0),
    (N'Customer', N'Storefront only — no admin pages.', 0);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.permissions)
BEGIN
INSERT INTO dbo.permissions (code, name, module)
VALUES
    (N'dashboard.view', N'View dashboard', N'Dashboard'),
    (N'products.view', N'View products', N'Products'),
    (N'products.create', N'Create products', N'Products'),
    (N'products.edit', N'Edit products', N'Products'),
    (N'products.delete', N'Delete products', N'Products'),
    (N'categories.view', N'View categories', N'Categories'),
    (N'categories.create', N'Create categories', N'Categories'),
    (N'categories.edit', N'Edit categories', N'Categories'),
    (N'categories.delete', N'Delete categories', N'Categories'),
    (N'inventory.view', N'View inventory', N'Inventory'),
    (N'inventory.adjust', N'Adjust stock levels', N'Inventory'),
    (N'orders.view', N'View orders', N'Orders'),
    (N'orders.update', N'Update order status', N'Orders'),
    (N'customers.view', N'View customers', N'Customers'),
    (N'customers.edit', N'Edit / activate customers', N'Customers'),
    (N'banners.view', N'View banners', N'Banners'),
    (N'banners.manage', N'Create / edit banners', N'Banners'),
    (N'offers.view', N'View offers', N'Offers'),
    (N'offers.manage', N'Create / edit offers', N'Offers'),
    (N'blog.view', N'View articles', N'Blog'),
    (N'blog.manage', N'Create / edit articles', N'Blog'),
    (N'blog.publish', N'Publish / unpublish', N'Blog'),
    (N'reviews.view', N'View reviews', N'Reviews'),
    (N'reviews.moderate', N'Approve / reject reviews', N'Reviews'),
    (N'reviews.delete', N'Delete reviews', N'Reviews'),
    (N'homepage.view', N'View homepage sections', N'Homepage'),
    (N'homepage.edit', N'Reorder / toggle sections', N'Homepage'),
    (N'users.view', N'View users', N'Users'),
    (N'users.manage', N'Create / edit users', N'Users'),
    (N'users.delete', N'Deactivate users', N'Users'),
    (N'roles.view', N'View roles & permissions', N'Roles'),
    (N'roles.manage', N'Edit role permissions', N'Roles'),
    (N'settings.view', N'View store settings', N'Settings'),
    (N'settings.edit', N'Change store settings', N'Settings');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.role_permissions)
BEGIN
INSERT INTO dbo.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM (VALUES
    (N'Administrator', N'banners.manage'),
    (N'Administrator', N'banners.view'),
    (N'Administrator', N'blog.manage'),
    (N'Administrator', N'blog.publish'),
    (N'Administrator', N'blog.view'),
    (N'Administrator', N'categories.create'),
    (N'Administrator', N'categories.delete'),
    (N'Administrator', N'categories.edit'),
    (N'Administrator', N'categories.view'),
    (N'Administrator', N'customers.edit'),
    (N'Administrator', N'customers.view'),
    (N'Administrator', N'dashboard.view'),
    (N'Administrator', N'homepage.edit'),
    (N'Administrator', N'homepage.view'),
    (N'Administrator', N'inventory.adjust'),
    (N'Administrator', N'inventory.view'),
    (N'Administrator', N'offers.manage'),
    (N'Administrator', N'offers.view'),
    (N'Administrator', N'orders.update'),
    (N'Administrator', N'orders.view'),
    (N'Administrator', N'products.create'),
    (N'Administrator', N'products.delete'),
    (N'Administrator', N'products.edit'),
    (N'Administrator', N'products.view'),
    (N'Administrator', N'reviews.delete'),
    (N'Administrator', N'reviews.moderate'),
    (N'Administrator', N'reviews.view'),
    (N'Administrator', N'roles.manage'),
    (N'Administrator', N'roles.view'),
    (N'Administrator', N'settings.edit'),
    (N'Administrator', N'settings.view'),
    (N'Administrator', N'users.delete'),
    (N'Administrator', N'users.manage'),
    (N'Administrator', N'users.view'),
    (N'Manager', N'banners.manage'),
    (N'Manager', N'banners.view'),
    (N'Manager', N'blog.manage'),
    (N'Manager', N'blog.publish'),
    (N'Manager', N'blog.view'),
    (N'Manager', N'categories.create'),
    (N'Manager', N'categories.edit'),
    (N'Manager', N'categories.view'),
    (N'Manager', N'customers.edit'),
    (N'Manager', N'customers.view'),
    (N'Manager', N'dashboard.view'),
    (N'Manager', N'homepage.edit'),
    (N'Manager', N'homepage.view'),
    (N'Manager', N'inventory.adjust'),
    (N'Manager', N'inventory.view'),
    (N'Manager', N'offers.manage'),
    (N'Manager', N'offers.view'),
    (N'Manager', N'orders.update'),
    (N'Manager', N'orders.view'),
    (N'Manager', N'products.create'),
    (N'Manager', N'products.edit'),
    (N'Manager', N'products.view'),
    (N'Manager', N'reviews.delete'),
    (N'Manager', N'reviews.moderate'),
    (N'Manager', N'reviews.view'),
    (N'Manager', N'settings.view'),
    (N'Support', N'blog.view'),
    (N'Support', N'customers.edit'),
    (N'Support', N'customers.view'),
    (N'Support', N'dashboard.view'),
    (N'Support', N'orders.update'),
    (N'Support', N'orders.view'),
    (N'Support', N'products.view'),
    (N'Support', N'reviews.delete'),
    (N'Support', N'reviews.moderate'),
    (N'Support', N'reviews.view')
) AS m(role_name, permission_code)
JOIN dbo.roles r      ON r.name = m.role_name
JOIN dbo.permissions p ON p.code = m.permission_code;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.users)
BEGIN
INSERT INTO dbo.users (email, password_hash, first_name, last_name, phone, avatar, status, created_at)
VALUES
    (N'admin@aquashop.com', N'92340695899BD2D86223E4A007620E0D6502FC0E08809773634C7E0743764A9C', N'Ava', N'Sterling', N'+1 555-010-1000', N'https://i.pravatar.cc/150?img=47', N'Admin@123', N'2025-01-10'),
    (N'jordan@example.com', N'92340695899BD2D86223E4A007620E0D6502FC0E08809773634C7E0743764A9C', N'Jordan', N'Pike', N'+1 555-010-2000', N'https://i.pravatar.cc/150?img=12', N'Demo@123', N'2025-01-10'),
    (N'alicia.ruiz@example.com', N'92340695899BD2D86223E4A007620E0D6502FC0E08809773634C7E0743764A9C', N'Alicia', N'Ruiz', N'+1 555-010-2100', N'https://i.pravatar.cc/150?img=32', N'Password1', N'2025-01-10'),
    (N'devon.marsh@example.com', N'92340695899BD2D86223E4A007620E0D6502FC0E08809773634C7E0743764A9C', N'Devon', N'Marsh', N'+1 555-010-2200', N'https://i.pravatar.cc/150?img=15', N'Password1', N'2025-01-10'),
    (N'morgan.lee@example.com', N'AC7C949F1211B7814BDD28A698E6C04E05E1A83F9F86E7AD43D2086D00E98AFD', N'Morgan', N'Lee', N'+1 555-010-2300', N'https://i.pravatar.cc/150?img=25', N'Password1', N'2025-01-10'),
    (N'priya@aquashop.com', N'92340695899BD2D86223E4A007620E0D6502FC0E08809773634C7E0743764A9C', N'Priya', N'Nair', N'+1 555-010-2400', N'https://i.pravatar.cc/150?img=44', N'Manager@123', N'2025-01-10'),
    (N'support@aquashop.com', N'92340695899BD2D86223E4A007620E0D6502FC0E08809773634C7E0743764A9C', N'Sam', N'Okafor', N'+1 555-010-2500', N'https://i.pravatar.cc/150?img=53', N'Support@123', N'2025-01-10');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.user_roles)
BEGIN
INSERT INTO dbo.user_roles (user_id, role_id)
SELECT u.id, r.id
FROM (VALUES
    (N'admin@aquashop.com', N'Administrator'),
    (N'priya@aquashop.com', N'Manager'),
    (N'support@aquashop.com', N'Support'),
    (N'jordan@example.com', N'Customer'),
    (N'alicia.ruiz@example.com', N'Customer'),
    (N'devon.marsh@example.com', N'Customer'),
    (N'morgan.lee@example.com', N'Customer')
) AS m(email, role_name)
JOIN dbo.users u ON u.email = m.email
JOIN dbo.roles r ON r.name = m.role_name;
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.pages)
BEGIN
INSERT INTO dbo.pages (name, route, permission_code, icon, display_order)
VALUES
    (N'Dashboard', N'/admin/dashboard', N'dashboard.view', N'layout-dashboard', 1),
    (N'Products', N'/admin/products', N'products.view', N'package', 2),
    (N'Categories', N'/admin/categories', N'categories.view', N'layers', 3),
    (N'Inventory', N'/admin/inventory', N'inventory.view', N'clipboard-list', 4),
    (N'Orders', N'/admin/orders', N'orders.view', N'shopping-bag', 5),
    (N'Customers', N'/admin/customers', N'customers.view', N'users', 6),
    (N'Banners', N'/admin/banners', N'banners.view', N'image', 7),
    (N'Offers', N'/admin/offers', N'offers.view', N'tag', 8),
    (N'Blog', N'/admin/blog', N'blog.view', N'file-text', 9),
    (N'Reviews', N'/admin/reviews', N'reviews.view', N'star', 10),
    (N'Homepage', N'/admin/homepage', N'homepage.view', N'home', 11),
    (N'Users', N'/admin/users', N'users.view', N'user-cog', 12),
    (N'Roles', N'/admin/roles', N'roles.view', N'shield', 13),
    (N'Settings', N'/admin/settings', N'settings.view', N'settings', 14);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.categories)
BEGIN
INSERT INTO dbo.categories (id, name, slug, description, image, parent_id, display_order, is_featured, is_active)
VALUES
    (N'cat-fish', N'Fish', N'fish', N'Freshwater and tropical fish for every skill level, from hardy beginner species to vibrant showpiece breeds.', N'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=800&q=80', NULL, 1, 1, 1),
    (N'cat-fish-food', N'Fish Food', N'fish-food', N'Flakes, pellets, and live feed formulated for healthy color, growth, and digestion.', N'https://images.unsplash.com/photo-1596797882870-8c33deeaaa8e?w=800&q=80', NULL, 2, 1, 1),
    (N'cat-accessories', N'Accessories', N'accessories', N'Everything else your aquarium needs — tanks, filtration, lighting, plants, and care essentials.', N'https://images.unsplash.com/photo-1520302519104-c452c2eddb56?w=800&q=80', NULL, 3, 1, 1),
    (N'cat-tanks', N'Aquarium Tanks', N'aquarium-tanks', N'Glass and acrylic tanks and starter kits in every size, from nano desktop tanks to full room centerpieces.', N'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=800&q=80', N'cat-accessories', 1, 1, 1),
    (N'cat-plants', N'Aquarium Plants', N'aquarium-plants', N'Live and hardy aquatic plants that oxygenate water and give fish natural cover.', N'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=800&q=80', N'cat-accessories', 2, 1, 1),
    (N'cat-filters', N'Filters', N'filters', N'Canister, hang-on-back, and sponge filters for crystal-clear, healthy water.', N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', N'cat-accessories', 3, 0, 1),
    (N'cat-air-pumps', N'Air Pumps', N'air-pumps', N'Quiet, energy-efficient air pumps for reliable oxygenation.', N'https://images.unsplash.com/photo-1520302659201-63bdcc245f4d?w=800&q=80', N'cat-accessories', 4, 0, 1),
    (N'cat-water-pumps', N'Water Pumps', N'water-pumps', N'Circulation and wavemaker pumps for stronger flow and healthier tanks.', N'https://images.unsplash.com/photo-1499242611767-cf8b9be02854?w=800&q=80', N'cat-accessories', 5, 0, 1),
    (N'cat-heaters', N'Heaters', N'heaters', N'Precision aquarium heaters that hold stable, tropical-safe temperatures.', N'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=800&q=80', N'cat-accessories', 6, 0, 1),
    (N'cat-lighting', N'Lighting', N'lighting', N'Full-spectrum LED lighting that supports plant growth and shows off natural fish color.', N'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=800&q=80', N'cat-accessories', 7, 1, 1),
    (N'cat-decorations', N'Decorations', N'decorations', N'Driftwood, rockwork, and ornaments that create natural hiding spots and striking aquascapes.', N'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=800&q=80', N'cat-accessories', 8, 0, 1),
    (N'cat-cleaning', N'Cleaning Equipment', N'cleaning-equipment', N'Gravel vacuums, algae scrapers, and water conditioners that make maintenance simple.', N'https://images.unsplash.com/photo-1584967911318-3ce0dd6f4ca0?w=800&q=80', N'cat-accessories', 9, 0, 1),
    (N'cat-fish-care', N'Fish Care', N'fish-care', N'Medicines, water conditioners, and test kits to keep fish healthy and water balanced.', N'https://images.unsplash.com/photo-1522911512095-8ce38fbc37e6?w=800&q=80', N'cat-accessories', 10, 0, 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.products)
BEGIN
INSERT INTO dbo.products (id, sku, slug, name, category_id, subcategory_id, brand, short_description, description, price, sale_price, cost_price, currency, stock_quantity, minimum_stock, track_inventory, allow_backorders, rating_average, rating_count, is_active, is_featured, created_at, meta_title, meta_description)
VALUES
    (N'p-neon-tetra', N'FSH-001', N'neon-tetra', N'Neon Tetra', N'cat-fish', NULL, N'AquaLife', N'A schooling classic with an electric blue-and-red stripe.', N'Neon Tetras are peaceful, hardy schoolers that bring vivid color to any community tank. Best kept in groups of 6 or more, they thrive in softly lit, planted aquariums with stable water conditions.', 4.49, NULL, NULL, N'NPR', 86, 15, 1, 0, 4.80, 212, 1, 1, N'2025-11-02', N'Neon Tetra — Live Freshwater Fish | AquaShop', N'Buy healthy Neon Tetras online. Hardy, colorful schooling fish perfect for community tanks.'),
    (N'p-betta-fish', N'FSH-002', N'betta-fish', N'Betta Fish', N'cat-fish', NULL, N'AquaLife', N'Flowing fins and jewel-toned color in a low-maintenance solo fish.', N'Also known as the Siamese Fighting Fish, the Betta is prized for its flowing fins and rich color variety. Bettas do best alone or with carefully chosen tankmates, in a heated, filtered tank.', 12.99, NULL, NULL, N'NPR', 40, 10, 1, 0, 4.90, 341, 1, 1, N'2026-01-15', N'Betta Fish — Live Siamese Fighting Fish | AquaShop', N'Shop vibrant, healthy Betta fish with flowing fins, ready to ship.'),
    (N'p-fancy-goldfish', N'FSH-003', N'fancy-goldfish', N'Fancy Goldfish', N'cat-fish', NULL, N'PondCraft', N'Rounded body and flowing double tail in classic orange-and-white.', N'Fancy Goldfish are hardy, personable fish suited to spacious tanks or ponds. They love room to swim and benefit from strong filtration due to their appetite.', 9.99, NULL, NULL, N'NPR', 30, 8, 1, 0, 4.60, 98, 1, 0, N'2025-09-20', N'Fancy Goldfish — Live Fish | AquaShop', N'Hardy, colorful Fancy Goldfish for tanks and ponds.'),
    (N'p-guppy', N'FSH-004', N'guppy', N'Guppy', N'cat-fish', NULL, N'AquaLife', N'Prolific, colorful, and endlessly easy to keep.', N'Guppies are among the easiest fish to keep, tolerating a wide range of water conditions while showing off tail patterns in nearly every color.', 3.99, NULL, NULL, N'NPR', 120, 20, 1, 0, 4.70, 156, 1, 0, N'2026-02-01', N'Guppy Fish — Live Freshwater Fish | AquaShop', N'Colorful, hardy Guppies for beginner and community tanks.'),
    (N'p-angelfish', N'FSH-005', N'angelfish', N'Angelfish', N'cat-fish', NULL, N'AquaLife', N'A graceful, tall-bodied centerpiece for larger community tanks.', N'Angelfish bring elegant vertical silhouettes and calm movement to taller aquariums. They pair well with similarly sized, peaceful tankmates.', 14.49, NULL, NULL, N'NPR', 22, 6, 1, 0, 4.70, 74, 1, 1, N'2025-10-11', N'Angelfish — Live Freshwater Cichlid | AquaShop', N'Elegant Angelfish for medium to large community aquariums.'),
    (N'p-cory-catfish', N'FSH-006', N'cory-catfish', N'Cory Catfish', N'cat-fish', NULL, N'AquaLife', N'A friendly bottom-dweller that keeps the substrate clean.', N'Corydoras catfish are gentle, social bottom-feeders that patrol the substrate for leftover food, best kept in groups of 4 or more.', 5.99, NULL, NULL, N'NPR', 54, 10, 1, 0, 4.80, 61, 1, 0, N'2025-08-19', N'Cory Catfish — Live Bottom-Feeder Fish | AquaShop', N'Peaceful Cory Catfish, great for substrate cleanup in community tanks.'),
    (N'p-tropical-flakes', N'FD-001', N'tropical-fish-flakes', N'Tropical Fish Flakes', N'cat-fish-food', NULL, N'ReefNutri', N'Daily staple flake food for vibrant color and steady growth.', N'A balanced flake formula with natural color enhancers and essential vitamins, floats initially then slowly sinks to reach mid-water feeders.', 8.99, NULL, NULL, N'NPR', 74, 15, 1, 1, 4.60, 189, 1, 1, N'2025-07-04', N'Tropical Fish Flakes | AquaShop', N'Balanced daily flake food for vivid color and healthy growth.'),
    (N'p-betta-pellets', N'FD-002', N'betta-pellets', N'Betta Pellets', N'cat-fish-food', NULL, N'ReefNutri', N'Protein-rich floating pellets sized for Betta mouths.', N'Slow-sinking pellets formulated with high protein content to support the natural carnivorous diet of Bettas and reduce waste.', 6.49, NULL, NULL, N'NPR', 60, 15, 1, 1, 4.70, 143, 1, 0, N'2025-12-05', N'Betta Pellets | AquaShop', N'High-protein floating pellets formulated for Betta fish.'),
    (N'p-goldfish-food', N'FD-003', N'goldfish-food', N'Goldfish Food', N'cat-fish-food', NULL, N'PondCraft', N'Easy-to-digest floating sticks for goldfish and koi.', N'Wheat-germ based sticks that are gentle on sensitive goldfish digestion, supporting healthy growth without clouding water.', 5.49, NULL, NULL, N'NPR', 5, 10, 1, 1, 4.40, 87, 1, 0, N'2025-06-14', N'Goldfish Food | AquaShop', N'Wheat-germ based floating sticks for goldfish and koi.'),
    (N'p-freeze-dried-brine', N'FD-004', N'freeze-dried-brine-shrimp', N'Freeze-Dried Brine Shrimp', N'cat-fish-food', NULL, N'ReefNutri', N'A protein-packed treat that fish go wild for.', N'Whole brine shrimp, freeze-dried to lock in nutrients, ideal as a supplemental treat to encourage natural foraging behavior.', 7.99, NULL, NULL, N'NPR', 45, 10, 1, 1, 4.80, 121, 1, 1, N'2026-01-28', N'Freeze-Dried Brine Shrimp | AquaShop', N'Nutrient-rich freeze-dried brine shrimp treat for freshwater and marine fish.'),
    (N'p-starter-kit-20', N'TK-001', N'aquarium-starter-kit-20gal', N'Aquarium Starter Kit (20 Gal)', N'cat-accessories', N'cat-tanks', N'ReefTech', N'Everything a beginner needs: tank, filter, light, and lid in one box.', N'This all-in-one 20-gallon kit includes a rimless glass tank, quiet hang-on filter, full-spectrum LED hood, and a starter water conditioner sample — ideal for a first freshwater setup.', 129.99, 104.99, NULL, N'NPR', 18, 5, 1, 0, 4.70, 96, 1, 1, N'2025-09-01', N'Aquarium Starter Kit 20 Gallon | AquaShop', N'Complete 20-gallon starter kit with tank, filter, and LED lighting.'),
    (N'p-nano-tank-5', N'TK-002', N'nano-desktop-tank-5gal', N'Nano Desktop Tank (5 Gal)', N'cat-accessories', N'cat-tanks', N'ReefTech', N'A compact, low-iron glass tank made for desks and shelves.', N'Low-iron glass gives this nano tank exceptional clarity, ideal for a Betta, nano shrimp, or a small planted aquascape.', 49.99, NULL, NULL, N'NPR', 32, 8, 1, 0, 4.50, 58, 1, 0, N'2025-11-22', N'Nano Desktop Tank 5 Gallon | AquaShop', N'Crystal-clear low-iron glass nano tank for desktop aquascapes.'),
    (N'p-reef-tank-55', N'TK-003', N'aquarium-tank-55gal', N'Aquarium Tank (55 Gal)', N'cat-accessories', N'cat-tanks', N'ReefTech', N'A spacious statement tank built for community and cichlid setups.', N'Braced glass construction gives this 55-gallon tank the strength for a larger aquascape, tall enough for angelfish and roomy enough for an active community.', 219.99, NULL, NULL, N'NPR', 9, 3, 1, 0, 4.60, 34, 1, 0, N'2025-05-30', N'Aquarium Tank 55 Gallon | AquaShop', N'Spacious 55-gallon glass tank for community and cichlid aquariums.'),
    (N'p-java-fern', N'PL-001', N'java-fern', N'Java Fern', N'cat-accessories', N'cat-plants', N'GreenReef', N'An unkillable, low-light plant that attaches to wood and rock.', N'Java Fern thrives in low to moderate light and doesn’t need substrate — simply tie it to driftwood or rock and let the roots take hold.', 6.99, NULL, NULL, N'NPR', 65, 15, 1, 1, 4.90, 178, 1, 1, N'2025-08-08', N'Java Fern — Live Aquarium Plant | AquaShop', N'Hardy, low-light Java Fern, easy to attach to driftwood or rock.'),
    (N'p-anubias', N'PL-002', N'anubias-plant', N'Anubias Plant', N'cat-accessories', N'cat-plants', N'GreenReef', N'Broad, sturdy leaves that stand up to grazing fish.', N'Anubias is nearly indestructible, tolerating low light and a wide range of water conditions while providing sturdy cover for shy fish.', 8.49, NULL, NULL, N'NPR', 50, 12, 1, 1, 4.80, 132, 1, 0, N'2025-10-02', N'Anubias — Live Aquarium Plant | AquaShop', N'Sturdy, low-maintenance Anubias plant for any freshwater tank.'),
    (N'p-amazon-sword', N'PL-003', N'amazon-sword-plant', N'Amazon Sword Plant', N'cat-accessories', N'cat-plants', N'GreenReef', N'A bold, tall centerpiece plant for the background of the tank.', N'Broad sword-shaped leaves make this a striking background plant, rooting in substrate and growing tall with good lighting.', 9.99, NULL, NULL, N'NPR', 38, 10, 1, 1, 4.60, 71, 1, 0, N'2025-07-19', N'Amazon Sword Plant | AquaShop', N'Bold background sword plant for freshwater aquariums.'),
    (N'p-canister-filter', N'FL-001', N'external-canister-filter', N'External Canister Filter', N'cat-accessories', N'cat-filters', N'ReefTech', N'Multi-stage filtration for tanks up to 75 gallons.', N'This external canister filter runs mechanical, biological, and chemical media stages for powerful, quiet filtration well suited to medium and large aquariums.', 89.99, NULL, NULL, N'NPR', 0, 5, 1, 1, 4.70, 104, 1, 1, N'2025-09-14', N'External Canister Filter | AquaShop', N'Powerful multi-stage canister filter for medium to large aquariums.'),
    (N'p-hob-filter', N'FL-002', N'hang-on-back-filter', N'Hang-On-Back Filter', N'cat-accessories', N'cat-filters', N'ReefTech', N'A quiet, easy-to-service filter for tanks up to 30 gallons.', N'Simple to install on the back of the tank, with replaceable cartridges for mechanical and chemical filtration and an adjustable flow rate.', 34.99, NULL, NULL, N'NPR', 41, 10, 1, 0, 4.50, 87, 1, 0, N'2025-06-27', N'Hang-On-Back Filter | AquaShop', N'Easy-to-install hang-on-back filter for small to medium tanks.'),
    (N'p-sponge-filter', N'FL-003', N'sponge-filter', N'Sponge Filter', N'cat-accessories', N'cat-filters', N'AquaLife', N'Gentle biological filtration, safe for fry and shrimp.', N'Powered by an air pump, this sponge filter offers gentle flow and excellent biological filtration without pulling in fry or shrimp.', 12.99, NULL, NULL, N'NPR', 55, 12, 1, 1, 4.60, 63, 1, 0, N'2025-12-18', N'Sponge Filter | AquaShop', N'Gentle, fry-safe sponge filter for breeding and shrimp tanks.'),
    (N'p-air-pump', N'AP-001', N'quiet-air-pump', N'Quiet Air Pump', N'cat-accessories', N'cat-air-pumps', N'ReefTech', N'Whisper-quiet oxygenation for tanks up to 40 gallons.', N'A dual-outlet air pump with a noise-dampening design, ideal for powering sponge filters, air stones, and ornaments.', 19.99, NULL, NULL, N'NPR', 47, 10, 1, 0, 4.50, 92, 1, 0, N'2025-11-09', N'Quiet Air Pump | AquaShop', N'Whisper-quiet dual-outlet air pump for reliable oxygenation.'),
    (N'p-water-pump', N'WP-001', N'submersible-water-pump', N'Submersible Water Pump', N'cat-accessories', N'cat-water-pumps', N'ReefTech', N'Compact circulation pump for water changes and wave flow.', N'A versatile submersible pump for drainage during water changes, waterfall features, or adding gentle circulation to still corners of the tank.', 24.99, NULL, NULL, N'NPR', 29, 8, 1, 0, 4.40, 45, 1, 0, N'2025-08-25', N'Submersible Water Pump | AquaShop', N'Compact, reliable submersible pump for circulation and water changes.'),
    (N'p-aquarium-heater', N'HT-001', N'aquarium-heater', N'Aquarium Heater', N'cat-accessories', N'cat-heaters', N'ReefTech', N'Precise, shatter-resistant heating for tropical tanks.', N'An adjustable submersible heater that holds a stable temperature within half a degree, with an external dial and safety auto shut-off.', 22.99, NULL, NULL, N'NPR', 60, 12, 1, 1, 4.70, 138, 1, 1, N'2025-07-30', N'Aquarium Heater | AquaShop', N'Adjustable, shatter-resistant aquarium heater for stable tropical temperatures.'),
    (N'p-led-light', N'LT-001', N'led-aquarium-light', N'LED Aquarium Light', N'cat-accessories', N'cat-lighting', N'ReefTech', N'Full-spectrum lighting that makes color and plants pop.', N'This slim LED fixture spans the full spectrum for vibrant fish color and healthy plant growth, with adjustable brightness and a built-in timer.', 44.99, 36.99, NULL, N'NPR', 33, 8, 1, 0, 4.80, 167, 1, 1, N'2025-10-27', N'LED Aquarium Light | AquaShop', N'Full-spectrum LED aquarium light with timer for plants and color.'),
    (N'p-driftwood', N'DC-001', N'driftwood-decoration', N'Driftwood Decoration', N'cat-accessories', N'cat-decorations', N'GreenReef', N'Natural, aquarium-safe driftwood for aquascaping and plant mounting.', N'Each piece is pre-soaked and sinks reliably, providing a natural centerpiece and an anchor point for Java Fern, Anubias, and moss.', 18.99, NULL, NULL, N'NPR', 27, 6, 1, 1, 4.70, 54, 1, 0, N'2025-09-08', N'Driftwood Decoration | AquaShop', N'Natural, pre-soaked driftwood for aquascaping and plant mounting.'),
    (N'p-rock-cave', N'DC-002', N'aquarium-rock-cave', N'Aquarium Rock Cave', N'cat-accessories', N'cat-decorations', N'GreenReef', N'A resin cave that gives shy fish a natural hideaway.', N'Textured to look like natural stone, this hollow cave gives cichlids, catfish, and shrimp a safe place to retreat and breed.', 14.49, NULL, NULL, N'NPR', 36, 8, 1, 1, 4.50, 41, 1, 0, N'2025-06-02', N'Aquarium Rock Cave | AquaShop', N'Natural-look resin cave hideaway for fish and shrimp.'),
    (N'p-gravel-vacuum', N'CL-001', N'gravel-vacuum-cleaner', N'Gravel Vacuum Cleaner', N'cat-accessories', N'cat-cleaning', N'ReefTech', N'Siphon gravel debris while doing routine water changes.', N'This hand-pump gravel vacuum starts the siphon without any mouth suction, making routine water changes fast and mess-free.', 15.99, NULL, NULL, N'NPR', 48, 10, 1, 0, 4.60, 112, 1, 0, N'2025-05-15', N'Gravel Vacuum Cleaner | AquaShop', N'No-spill gravel vacuum for easy, mess-free water changes.'),
    (N'p-algae-scraper', N'CL-002', N'magnetic-algae-scraper', N'Magnetic Algae Scraper', N'cat-accessories', N'cat-cleaning', N'ReefTech', N'Clean glass from outside the tank without getting your hands wet.', N'A dual-magnet scraper glides across the glass, lifting algae with a scrubbing pad on one side and a scraper blade on the other for stubborn spots.', 11.99, NULL, NULL, N'NPR', 3, 8, 1, 1, 4.50, 76, 1, 0, N'2025-04-21', N'Magnetic Algae Scraper | AquaShop', N'Glide-clean magnetic algae scraper for glass aquariums.'),
    (N'p-water-conditioner', N'CL-003', N'water-conditioner', N'Water Conditioner', N'cat-accessories', N'cat-cleaning', N'ReefNutri', N'Instantly neutralizes chlorine and chloramine for safe tap water.', N'A few drops per gallon make tap water safe for fish instantly, neutralizing chlorine, chloramine, and heavy metals while adding a protective slime coat.', 9.49, NULL, NULL, N'NPR', 70, 15, 1, 1, 4.90, 203, 1, 1, N'2025-03-11', N'Water Conditioner | AquaShop', N'Instant tap water conditioner that neutralizes chlorine and chloramine.'),
    (N'p-fish-medicine', N'FC-001', N'ich-treatment-medicine', N'Ich Treatment Medicine', N'cat-accessories', N'cat-fish-care', N'ReefNutri', N'Fast-acting treatment for white-spot disease (Ich).', N'A trusted formula that treats and helps prevent Ich (white spot disease) in freshwater aquariums, safe for use with most fish species when dosed as directed.', 13.99, NULL, NULL, N'NPR', 26, 8, 1, 1, 4.50, 88, 1, 0, N'2025-04-02', N'Ich Treatment Medicine | AquaShop', N'Fast-acting freshwater Ich (white spot) treatment.'),
    (N'p-test-kit', N'FC-002', N'water-test-kit', N'Water Test Kit', N'cat-accessories', N'cat-fish-care', N'ReefNutri', N'Test ammonia, nitrite, nitrate, and pH in minutes.', N'A liquid-based master test kit covering the four core water parameters every aquarist should monitor, with a color chart for quick, accurate reads.', 24.99, NULL, NULL, N'NPR', 44, 10, 1, 1, 4.80, 231, 1, 1, N'2025-02-18', N'Water Test Kit | AquaShop', N'Liquid master test kit for ammonia, nitrite, nitrate, and pH.'),
    (N'p-stress-coat', N'FC-003', N'stress-coat-solution', N'Stress Coat Solution', N'cat-accessories', N'cat-fish-care', N'ReefNutri', N'Eases fish stress during transport, water changes, or new tank setup.', N'This aloe-based solution helps fish recover from the stress of handling, shipping, or fin damage by supporting the natural slime coat.', 10.99, NULL, NULL, N'NPR', 51, 12, 1, 1, 4.70, 97, 1, 0, N'2025-01-25', N'Stress Coat Solution | AquaShop', N'Aloe-based stress coat solution to protect and soothe fish.'),
    (N'p-molly-fish', N'FSH-007', N'molly-fish', N'Molly Fish', N'cat-fish', NULL, N'AquaLife', N'A hardy livebearer available in black, silver, and dalmatian patterns.', N'Mollies adapt well to both fresh and slightly brackish water, making them a flexible, active addition to a community tank.', 4.99, NULL, NULL, N'NPR', 68, 15, 1, 0, 4.60, 59, 1, 0, N'2025-12-30', N'Molly Fish | AquaShop', N'Hardy, colorful Molly fish for community aquariums.'),
    (N'p-platy-fish', N'FSH-008', N'platy-fish', N'Platy Fish', N'cat-fish', NULL, N'AquaLife', N'A compact, colorful livebearer perfect for beginners.', N'Platies are peaceful, undemanding fish available in a rainbow of colors, doing best in small groups within a planted community tank.', 4.49, NULL, NULL, N'NPR', 72, 15, 1, 0, 4.70, 66, 1, 0, N'2026-02-10', N'Platy Fish | AquaShop', N'Colorful, easy-care Platy fish for community tanks.'),
    (N'p-cichlid-pellets', N'FD-005', N'cichlid-pellets', N'Cichlid Pellets', N'cat-fish-food', NULL, N'ReefNutri', N'High-protein sinking pellets for cichlids and larger fish.', N'Formulated for the higher protein needs of cichlids, these sinking pellets support vibrant color and reduce aggression from underfeeding.', 9.99, NULL, NULL, N'NPR', 39, 10, 1, 1, 4.60, 52, 1, 0, N'2025-09-27', N'Cichlid Pellets | AquaShop', N'High-protein sinking pellets formulated for cichlids.'),
    (N'p-algae-wafers', N'FD-006', N'algae-wafers', N'Algae Wafers', N'cat-fish-food', NULL, N'ReefNutri', N'Sinking wafers for plecos, catfish, and other bottom feeders.', N'These slow-dissolving wafers deliver balanced nutrition to algae-eating bottom dwellers without clouding the water.', 6.99, NULL, NULL, N'NPR', 58, 12, 1, 1, 4.70, 84, 1, 0, N'2025-11-15', N'Algae Wafers | AquaShop', N'Sinking algae wafers for plecos, catfish, and bottom feeders.'),
    (N'p-moss-ball', N'PL-004', N'marimo-moss-ball', N'Marimo Moss Ball', N'cat-accessories', N'cat-plants', N'GreenReef', N'A living, zero-maintenance sphere of moss that filters water naturally.', N'Marimo moss balls are a unique, slow-growing algae species that help absorb nitrates and add a soft, natural touch to any tank — safe with shrimp and Betta fish.', 7.49, NULL, NULL, N'NPR', 62, 12, 1, 1, 4.90, 145, 1, 1, N'2026-02-20', N'Marimo Moss Ball | AquaShop', N'Living, zero-maintenance Marimo moss ball for any freshwater tank.'),
    (N'p-wavemaker', N'WP-002', N'wavemaker-circulation-pump', N'Wavemaker Circulation Pump', N'cat-accessories', N'cat-water-pumps', N'ReefTech', N'Adjustable-flow pump that eliminates dead spots in larger tanks.', N'A magnetic-mount wavemaker with adjustable flow, ideal for reef and larger freshwater tanks that need stronger circulation.', 39.99, NULL, NULL, N'NPR', 17, 6, 1, 0, 4.50, 29, 1, 0, N'2025-10-05', N'Wavemaker Circulation Pump | AquaShop', N'Adjustable magnetic wavemaker pump for stronger tank circulation.'),
    (N'p-mini-heater', N'HT-002', N'mini-nano-heater', N'Mini Nano Heater', N'cat-accessories', N'cat-heaters', N'ReefTech', N'A compact, preset heater built for tanks under 10 gallons.', N'Sized for nano tanks, this preset heater holds a stable 78°F without a bulky external controller, perfect for a single Betta setup.', 14.99, NULL, NULL, N'NPR', 43, 10, 1, 1, 4.40, 37, 1, 0, N'2025-12-12', N'Mini Nano Heater | AquaShop', N'Compact preset heater built for nano tanks under 10 gallons.'),
    (N'p-clip-light', N'LT-002', N'clip-on-nano-light', N'Clip-On Nano Light', N'cat-accessories', N'cat-lighting', N'ReefTech', N'A flexible-arm LED light that clips onto rimless nano tanks.', N'This lightweight clip-on fixture is ideal for nano and desktop tanks, with a bendable gooseneck arm and three brightness settings.', 21.99, NULL, NULL, N'NPR', 25, 6, 1, 0, 4.30, 22, 1, 0, N'2025-08-31', N'Clip-On Nano Light | AquaShop', N'Flexible clip-on LED light for nano and desktop aquariums.'),
    (N'p-background-poster', N'DC-003', N'aquarium-background-poster', N'Aquarium Background Poster', N'cat-accessories', N'cat-decorations', N'GreenReef', N'A double-sided ocean and jungle scene that adheres to the back of the tank.', N'This vinyl background instantly adds depth and color, hiding tank equipment behind an underwater scene visible from any angle.', 8.99, NULL, NULL, N'NPR', 40, 10, 1, 1, 4.20, 28, 1, 0, N'2025-07-12', N'Aquarium Background Poster | AquaShop', N'Double-sided vinyl background poster for a natural aquarium scene.'),
    (N'p-fish-net', N'CL-004', N'fine-mesh-fish-net', N'Fine Mesh Fish Net', N'cat-accessories', N'cat-cleaning', N'ReefTech', N'A soft, fine-mesh net that’s gentle on fins and scales.', N'The fine mesh and rounded frame make catching fish for water changes or tank transfers quick and stress-free.', 5.99, NULL, NULL, N'NPR', 80, 15, 1, 1, 4.60, 54, 1, 0, N'2025-05-05', N'Fine Mesh Fish Net | AquaShop', N'Soft, fine-mesh fish net gentle on fins and scales.');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.product_images)
BEGIN
INSERT INTO dbo.product_images (product_id, url, sort_order)
VALUES
    (N'p-neon-tetra', N'https://images.unsplash.com/photo-1520302519104-c452c2eddb56?w=900&q=80', 0),
    (N'p-betta-fish', N'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=900&q=80', 0),
    (N'p-fancy-goldfish', N'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=900&q=80', 0),
    (N'p-guppy', N'https://images.unsplash.com/photo-1520302659201-63bdcc245f4d?w=900&q=80', 0),
    (N'p-angelfish', N'https://images.unsplash.com/photo-1499242611767-cf8b9be02854?w=900&q=80', 0),
    (N'p-cory-catfish', N'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=900&q=80', 0),
    (N'p-tropical-flakes', N'https://images.unsplash.com/photo-1596797882870-8c33deeaaa8e?w=900&q=80', 0),
    (N'p-betta-pellets', N'https://images.unsplash.com/photo-1584967911318-3ce0dd6f4ca0?w=900&q=80', 0),
    (N'p-goldfish-food', N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80', 0),
    (N'p-freeze-dried-brine', N'https://images.unsplash.com/photo-1522911512095-8ce38fbc37e6?w=900&q=80', 0),
    (N'p-starter-kit-20', N'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=900&q=80', 0),
    (N'p-nano-tank-5', N'https://images.unsplash.com/photo-1520302519104-c452c2eddb56?w=900&q=80', 0),
    (N'p-reef-tank-55', N'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=900&q=80', 0),
    (N'p-java-fern', N'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=900&q=80', 0),
    (N'p-anubias', N'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=900&q=80', 0),
    (N'p-amazon-sword', N'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=900&q=80', 0),
    (N'p-canister-filter', N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80', 0),
    (N'p-hob-filter', N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80', 0),
    (N'p-sponge-filter', N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=900&q=80', 0),
    (N'p-air-pump', N'https://images.unsplash.com/photo-1520302659201-63bdcc245f4d?w=900&q=80', 0),
    (N'p-water-pump', N'https://images.unsplash.com/photo-1499242611767-cf8b9be02854?w=900&q=80', 0),
    (N'p-aquarium-heater', N'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=900&q=80', 0),
    (N'p-led-light', N'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=900&q=80', 0),
    (N'p-driftwood', N'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=900&q=80', 0),
    (N'p-rock-cave', N'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=900&q=80', 0),
    (N'p-gravel-vacuum', N'https://images.unsplash.com/photo-1584967911318-3ce0dd6f4ca0?w=900&q=80', 0),
    (N'p-algae-scraper', N'https://images.unsplash.com/photo-1584967911318-3ce0dd6f4ca0?w=900&q=80', 0),
    (N'p-water-conditioner', N'https://images.unsplash.com/photo-1596797882870-8c33deeaaa8e?w=900&q=80', 0),
    (N'p-fish-medicine', N'https://images.unsplash.com/photo-1522911512095-8ce38fbc37e6?w=900&q=80', 0),
    (N'p-test-kit', N'https://images.unsplash.com/photo-1522911512095-8ce38fbc37e6?w=900&q=80', 0),
    (N'p-stress-coat', N'https://images.unsplash.com/photo-1522911512095-8ce38fbc37e6?w=900&q=80', 0),
    (N'p-molly-fish', N'https://images.unsplash.com/photo-1520302519104-c452c2eddb56?w=900&q=80', 0),
    (N'p-platy-fish', N'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=900&q=80', 0),
    (N'p-cichlid-pellets', N'https://images.unsplash.com/photo-1596797882870-8c33deeaaa8e?w=900&q=80', 0),
    (N'p-algae-wafers', N'https://images.unsplash.com/photo-1596797882870-8c33deeaaa8e?w=900&q=80', 0),
    (N'p-moss-ball', N'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=900&q=80', 0),
    (N'p-wavemaker', N'https://images.unsplash.com/photo-1499242611767-cf8b9be02854?w=900&q=80', 0),
    (N'p-mini-heater', N'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=900&q=80', 0),
    (N'p-clip-light', N'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=900&q=80', 0),
    (N'p-background-poster', N'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=900&q=80', 0),
    (N'p-fish-net', N'https://images.unsplash.com/photo-1584967911318-3ce0dd6f4ca0?w=900&q=80', 0);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.product_tags)
BEGIN
INSERT INTO dbo.product_tags (product_id, tag)
VALUES
    (N'p-neon-tetra', N'schooling'),
    (N'p-neon-tetra', N'beginner-friendly'),
    (N'p-neon-tetra', N'community'),
    (N'p-betta-fish', N'centerpiece'),
    (N'p-betta-fish', N'solo'),
    (N'p-betta-fish', N'colorful'),
    (N'p-fancy-goldfish', N'cold-water'),
    (N'p-fancy-goldfish', N'pond-safe'),
    (N'p-guppy', N'beginner-friendly'),
    (N'p-guppy', N'schooling'),
    (N'p-angelfish', N'centerpiece'),
    (N'p-angelfish', N'tall-tank'),
    (N'p-cory-catfish', N'bottom-dweller'),
    (N'p-cory-catfish', N'cleanup-crew'),
    (N'p-tropical-flakes', N'staple-food'),
    (N'p-tropical-flakes', N'daily-feed'),
    (N'p-betta-pellets', N'betta'),
    (N'p-betta-pellets', N'protein-rich'),
    (N'p-goldfish-food', N'goldfish'),
    (N'p-goldfish-food', N'pond-safe'),
    (N'p-freeze-dried-brine', N'treat'),
    (N'p-freeze-dried-brine', N'high-protein'),
    (N'p-starter-kit-20', N'starter-kit'),
    (N'p-starter-kit-20', N'beginner-friendly'),
    (N'p-nano-tank-5', N'nano'),
    (N'p-nano-tank-5', N'desktop'),
    (N'p-reef-tank-55', N'large-tank'),
    (N'p-reef-tank-55', N'community'),
    (N'p-java-fern', N'low-light'),
    (N'p-java-fern', N'beginner-plant'),
    (N'p-anubias', N'low-light'),
    (N'p-anubias', N'hardy'),
    (N'p-amazon-sword', N'background-plant'),
    (N'p-amazon-sword', N'centerpiece'),
    (N'p-canister-filter', N'filtration'),
    (N'p-canister-filter', N'canister'),
    (N'p-hob-filter', N'filtration'),
    (N'p-hob-filter', N'beginner-friendly'),
    (N'p-sponge-filter', N'fry-safe'),
    (N'p-sponge-filter', N'shrimp-safe'),
    (N'p-air-pump', N'quiet'),
    (N'p-air-pump', N'oxygenation'),
    (N'p-water-pump', N'circulation'),
    (N'p-water-pump', N'water-change'),
    (N'p-aquarium-heater', N'tropical'),
    (N'p-aquarium-heater', N'adjustable'),
    (N'p-led-light', N'plant-growth'),
    (N'p-led-light', N'color-enhancing'),
    (N'p-driftwood', N'aquascape'),
    (N'p-driftwood', N'plant-mounting'),
    (N'p-rock-cave', N'hideout'),
    (N'p-rock-cave', N'breeding'),
    (N'p-gravel-vacuum', N'maintenance'),
    (N'p-gravel-vacuum', N'water-change'),
    (N'p-algae-scraper', N'algae'),
    (N'p-algae-scraper', N'maintenance'),
    (N'p-water-conditioner', N'water-treatment'),
    (N'p-water-conditioner', N'essential'),
    (N'p-fish-medicine', N'medicine'),
    (N'p-fish-medicine', N'disease-treatment'),
    (N'p-test-kit', N'testing'),
    (N'p-test-kit', N'water-quality'),
    (N'p-stress-coat', N'stress-relief'),
    (N'p-stress-coat', N'new-fish'),
    (N'p-molly-fish', N'livebearer'),
    (N'p-molly-fish', N'beginner-friendly'),
    (N'p-platy-fish', N'livebearer'),
    (N'p-platy-fish', N'beginner-friendly'),
    (N'p-cichlid-pellets', N'cichlid'),
    (N'p-cichlid-pellets', N'high-protein'),
    (N'p-algae-wafers', N'bottom-feeder'),
    (N'p-algae-wafers', N'algae-eater'),
    (N'p-moss-ball', N'low-maintenance'),
    (N'p-moss-ball', N'shrimp-safe'),
    (N'p-wavemaker', N'circulation'),
    (N'p-wavemaker', N'reef-ready'),
    (N'p-mini-heater', N'nano'),
    (N'p-mini-heater', N'preset'),
    (N'p-clip-light', N'nano'),
    (N'p-clip-light', N'desktop'),
    (N'p-background-poster', N'background'),
    (N'p-background-poster', N'decorative'),
    (N'p-fish-net', N'handling'),
    (N'p-fish-net', N'gentle');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.product_badges)
BEGIN
INSERT INTO dbo.product_badges (product_id, badge)
VALUES
    (N'p-neon-tetra', N'BEST SELLER'),
    (N'p-betta-fish', N'BEST SELLER'),
    (N'p-betta-fish', N'NEW'),
    (N'p-guppy', N'NEW'),
    (N'p-tropical-flakes', N'BEST SELLER'),
    (N'p-goldfish-food', N'LOW STOCK'),
    (N'p-freeze-dried-brine', N'NEW'),
    (N'p-starter-kit-20', N'SALE'),
    (N'p-starter-kit-20', N'BEST SELLER'),
    (N'p-java-fern', N'BEST SELLER'),
    (N'p-aquarium-heater', N'BEST SELLER'),
    (N'p-led-light', N'SALE'),
    (N'p-algae-scraper', N'LOW STOCK'),
    (N'p-water-conditioner', N'BEST SELLER'),
    (N'p-test-kit', N'BEST SELLER'),
    (N'p-platy-fish', N'NEW'),
    (N'p-moss-ball', N'NEW');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.product_attributes)
BEGIN
INSERT INTO dbo.product_attributes (product_id, attribute_type, label, value, sort_order)
VALUES
    (N'p-neon-tetra', N'attribute', N'Fish Type', N'Tetra', 0),
    (N'p-neon-tetra', N'attribute', N'Size', N'1.5 in', 1),
    (N'p-neon-tetra', N'attribute', N'Color', N'Blue & Red', 2),
    (N'p-neon-tetra', N'attribute', N'Water Temperature', N'72–78°F', 3),
    (N'p-neon-tetra', N'attribute', N'pH', N'6.0–7.0', 4),
    (N'p-neon-tetra', N'attribute', N'Compatibility', N'Peaceful community', 5),
    (N'p-neon-tetra', N'attribute', N'Care Level', N'Easy', 6),
    (N'p-neon-tetra', N'attribute', N'Expected Lifespan', N'5–8 years', 7),
    (N'p-betta-fish', N'attribute', N'Fish Type', N'Betta', 0),
    (N'p-betta-fish', N'attribute', N'Size', N'2.5 in', 1),
    (N'p-betta-fish', N'attribute', N'Color', N'Assorted', 2),
    (N'p-betta-fish', N'attribute', N'Water Temperature', N'76–82°F', 3),
    (N'p-betta-fish', N'attribute', N'pH', N'6.5–7.5', 4),
    (N'p-betta-fish', N'attribute', N'Compatibility', N'Solo or peaceful tankmates only', 5),
    (N'p-betta-fish', N'attribute', N'Care Level', N'Easy', 6),
    (N'p-betta-fish', N'attribute', N'Expected Lifespan', N'3–5 years', 7),
    (N'p-fancy-goldfish', N'attribute', N'Fish Type', N'Goldfish', 0),
    (N'p-fancy-goldfish', N'attribute', N'Size', N'3 in', 1),
    (N'p-fancy-goldfish', N'attribute', N'Color', N'Orange & White', 2),
    (N'p-fancy-goldfish', N'attribute', N'Water Temperature', N'65–72°F', 3),
    (N'p-fancy-goldfish', N'attribute', N'pH', N'7.0–8.0', 4),
    (N'p-fancy-goldfish', N'attribute', N'Compatibility', N'Other goldfish', 5),
    (N'p-fancy-goldfish', N'attribute', N'Care Level', N'Moderate', 6),
    (N'p-fancy-goldfish', N'attribute', N'Expected Lifespan', N'10–15 years', 7),
    (N'p-guppy', N'attribute', N'Fish Type', N'Guppy', 0),
    (N'p-guppy', N'attribute', N'Size', N'1.5 in', 1),
    (N'p-guppy', N'attribute', N'Color', N'Assorted', 2),
    (N'p-guppy', N'attribute', N'Water Temperature', N'72–79°F', 3),
    (N'p-guppy', N'attribute', N'pH', N'7.0–8.0', 4),
    (N'p-guppy', N'attribute', N'Compatibility', N'Peaceful community', 5),
    (N'p-guppy', N'attribute', N'Care Level', N'Easy', 6),
    (N'p-guppy', N'attribute', N'Expected Lifespan', N'2–3 years', 7),
    (N'p-angelfish', N'attribute', N'Fish Type', N'Cichlid', 0),
    (N'p-angelfish', N'attribute', N'Size', N'3 in', 1),
    (N'p-angelfish', N'attribute', N'Color', N'Silver & Black', 2),
    (N'p-angelfish', N'attribute', N'Water Temperature', N'76–84°F', 3),
    (N'p-angelfish', N'attribute', N'pH', N'6.5–7.5', 4),
    (N'p-angelfish', N'attribute', N'Compatibility', N'Medium community, avoid small fish', 5),
    (N'p-angelfish', N'attribute', N'Care Level', N'Moderate', 6),
    (N'p-angelfish', N'attribute', N'Expected Lifespan', N'10 years', 7),
    (N'p-cory-catfish', N'attribute', N'Fish Type', N'Catfish', 0),
    (N'p-cory-catfish', N'attribute', N'Size', N'2 in', 1),
    (N'p-cory-catfish', N'attribute', N'Color', N'Bronze', 2),
    (N'p-cory-catfish', N'attribute', N'Water Temperature', N'72–78°F', 3),
    (N'p-cory-catfish', N'attribute', N'pH', N'6.5–7.5', 4),
    (N'p-cory-catfish', N'attribute', N'Compatibility', N'Peaceful community', 5),
    (N'p-cory-catfish', N'attribute', N'Care Level', N'Easy', 6),
    (N'p-cory-catfish', N'attribute', N'Expected Lifespan', N'5 years', 7),
    (N'p-tropical-flakes', N'attribute', N'Food Type', N'Flake', 0),
    (N'p-tropical-flakes', N'attribute', N'Weight', N'7.06 oz', 1),
    (N'p-tropical-flakes', N'attribute', N'Fish Type', N'Tropical Freshwater', 2),
    (N'p-tropical-flakes', N'attribute', N'Age Group', N'All Life Stages', 3),
    (N'p-tropical-flakes', N'attribute', N'Ingredients', N'Fish meal, wheat flour, spirulina, vitamins', 4),
    (N'p-betta-pellets', N'attribute', N'Food Type', N'Pellet', 0),
    (N'p-betta-pellets', N'attribute', N'Weight', N'1.2 oz', 1),
    (N'p-betta-pellets', N'attribute', N'Fish Type', N'Betta', 2),
    (N'p-betta-pellets', N'attribute', N'Age Group', N'Adult', 3),
    (N'p-betta-pellets', N'attribute', N'Ingredients', N'Fish meal, shrimp meal, vitamins', 4),
    (N'p-goldfish-food', N'attribute', N'Food Type', N'Floating Stick', 0),
    (N'p-goldfish-food', N'attribute', N'Weight', N'10 oz', 1),
    (N'p-goldfish-food', N'attribute', N'Fish Type', N'Goldfish/Koi', 2),
    (N'p-goldfish-food', N'attribute', N'Age Group', N'All Life Stages', 3),
    (N'p-goldfish-food', N'attribute', N'Ingredients', N'Wheat germ, fish meal, algae', 4),
    (N'p-freeze-dried-brine', N'attribute', N'Food Type', N'Freeze-Dried', 0),
    (N'p-freeze-dried-brine', N'attribute', N'Weight', N'0.5 oz', 1),
    (N'p-freeze-dried-brine', N'attribute', N'Fish Type', N'Most Freshwater & Marine', 2),
    (N'p-freeze-dried-brine', N'attribute', N'Age Group', N'Juvenile & Adult', 3),
    (N'p-freeze-dried-brine', N'attribute', N'Ingredients', N'100% brine shrimp', 4),
    (N'p-starter-kit-20', N'attribute', N'Capacity', N'20 gal', 0),
    (N'p-starter-kit-20', N'attribute', N'Dimensions', N'24 x 12 x 16 in', 1),
    (N'p-starter-kit-20', N'attribute', N'Material', N'Glass', 2),
    (N'p-starter-kit-20', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-starter-kit-20', N'attribute', N'Power', N'15W LED', 4),
    (N'p-nano-tank-5', N'attribute', N'Capacity', N'5 gal', 0),
    (N'p-nano-tank-5', N'attribute', N'Dimensions', N'14 x 8 x 10 in', 1),
    (N'p-nano-tank-5', N'attribute', N'Material', N'Low-Iron Glass', 2),
    (N'p-nano-tank-5', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-reef-tank-55', N'attribute', N'Capacity', N'55 gal', 0),
    (N'p-reef-tank-55', N'attribute', N'Dimensions', N'48 x 13 x 21 in', 1),
    (N'p-reef-tank-55', N'attribute', N'Material', N'Glass', 2),
    (N'p-reef-tank-55', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-java-fern', N'attribute', N'Light Requirement', N'Low–Medium', 0),
    (N'p-java-fern', N'attribute', N'Placement', N'Attach to hardscape', 1),
    (N'p-java-fern', N'attribute', N'Growth Rate', N'Slow', 2),
    (N'p-java-fern', N'attribute', N'Care Level', N'Easy', 3),
    (N'p-anubias', N'attribute', N'Light Requirement', N'Low', 0),
    (N'p-anubias', N'attribute', N'Placement', N'Attach to hardscape', 1),
    (N'p-anubias', N'attribute', N'Growth Rate', N'Very Slow', 2),
    (N'p-anubias', N'attribute', N'Care Level', N'Easy', 3),
    (N'p-amazon-sword', N'attribute', N'Light Requirement', N'Medium–High', 0),
    (N'p-amazon-sword', N'attribute', N'Placement', N'Substrate/Background', 1),
    (N'p-amazon-sword', N'attribute', N'Growth Rate', N'Moderate', 2),
    (N'p-amazon-sword', N'attribute', N'Care Level', N'Easy', 3),
    (N'p-canister-filter', N'attribute', N'Capacity', N'Up to 75 gal', 0),
    (N'p-canister-filter', N'attribute', N'Flow Rate', N'265 GPH', 1),
    (N'p-canister-filter', N'attribute', N'Material', N'ABS Plastic', 2),
    (N'p-canister-filter', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-canister-filter', N'attribute', N'Power', N'18W', 4),
    (N'p-hob-filter', N'attribute', N'Capacity', N'Up to 30 gal', 0),
    (N'p-hob-filter', N'attribute', N'Flow Rate', N'150 GPH', 1),
    (N'p-hob-filter', N'attribute', N'Material', N'Plastic', 2),
    (N'p-hob-filter', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-hob-filter', N'attribute', N'Power', N'7W', 4),
    (N'p-sponge-filter', N'attribute', N'Capacity', N'Up to 20 gal', 0),
    (N'p-sponge-filter', N'attribute', N'Flow Rate', N'Air-driven', 1),
    (N'p-sponge-filter', N'attribute', N'Material', N'Foam', 2),
    (N'p-sponge-filter', N'attribute', N'Brand', N'AquaLife', 3),
    (N'p-air-pump', N'attribute', N'Capacity', N'Up to 40 gal', 0),
    (N'p-air-pump', N'attribute', N'Outlets', N'2', 1),
    (N'p-air-pump', N'attribute', N'Material', N'Plastic', 2),
    (N'p-air-pump', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-air-pump', N'attribute', N'Power', N'3W', 4),
    (N'p-water-pump', N'attribute', N'Flow Rate', N'320 GPH', 0),
    (N'p-water-pump', N'attribute', N'Material', N'Ceramic Shaft', 1),
    (N'p-water-pump', N'attribute', N'Brand', N'ReefTech', 2),
    (N'p-water-pump', N'attribute', N'Power', N'8W', 3),
    (N'p-aquarium-heater', N'attribute', N'Capacity', N'Up to 30 gal', 0),
    (N'p-aquarium-heater', N'attribute', N'Wattage', N'100W', 1),
    (N'p-aquarium-heater', N'attribute', N'Material', N'Shatter-resistant Quartz', 2),
    (N'p-aquarium-heater', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-led-light', N'attribute', N'Capacity', N'Fits 20–29 gal', 0),
    (N'p-led-light', N'attribute', N'Spectrum', N'Full Spectrum', 1),
    (N'p-led-light', N'attribute', N'Material', N'Aluminum Housing', 2),
    (N'p-led-light', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-led-light', N'attribute', N'Power', N'15W', 4),
    (N'p-driftwood', N'attribute', N'Material', N'Natural Driftwood', 0),
    (N'p-driftwood', N'attribute', N'Dimensions', N'10–14 in', 1),
    (N'p-driftwood', N'attribute', N'Brand', N'GreenReef', 2),
    (N'p-rock-cave', N'attribute', N'Material', N'Aquarium-Safe Resin', 0),
    (N'p-rock-cave', N'attribute', N'Dimensions', N'6 x 4 x 4 in', 1),
    (N'p-rock-cave', N'attribute', N'Brand', N'GreenReef', 2),
    (N'p-gravel-vacuum', N'attribute', N'Material', N'Plastic', 0),
    (N'p-gravel-vacuum', N'attribute', N'Length', N'24 in', 1),
    (N'p-gravel-vacuum', N'attribute', N'Brand', N'ReefTech', 2),
    (N'p-algae-scraper', N'attribute', N'Material', N'Magnetic Foam & Plastic', 0),
    (N'p-algae-scraper', N'attribute', N'Glass Thickness', N'Up to 0.5 in', 1),
    (N'p-algae-scraper', N'attribute', N'Brand', N'ReefTech', 2),
    (N'p-water-conditioner', N'attribute', N'Volume', N'16.9 fl oz', 0),
    (N'p-water-conditioner', N'attribute', N'Treats Up To', N'3,368 gal', 1),
    (N'p-water-conditioner', N'attribute', N'Brand', N'ReefNutri', 2),
    (N'p-fish-medicine', N'attribute', N'Volume', N'8 fl oz', 0),
    (N'p-fish-medicine', N'attribute', N'Treats', N'Ich / white spot disease', 1),
    (N'p-fish-medicine', N'attribute', N'Brand', N'ReefNutri', 2),
    (N'p-test-kit', N'attribute', N'Tests For', N'Ammonia, Nitrite, Nitrate, pH', 0),
    (N'p-test-kit', N'attribute', N'Tests Included', N'~800', 1),
    (N'p-test-kit', N'attribute', N'Brand', N'ReefNutri', 2),
    (N'p-stress-coat', N'attribute', N'Volume', N'8 fl oz', 0),
    (N'p-stress-coat', N'attribute', N'Key Ingredient', N'Aloe vera', 1),
    (N'p-stress-coat', N'attribute', N'Brand', N'ReefNutri', 2),
    (N'p-molly-fish', N'attribute', N'Fish Type', N'Molly', 0),
    (N'p-molly-fish', N'attribute', N'Size', N'2.5 in', 1),
    (N'p-molly-fish', N'attribute', N'Color', N'Black/Silver/Dalmatian', 2),
    (N'p-molly-fish', N'attribute', N'Water Temperature', N'72–78°F', 3),
    (N'p-molly-fish', N'attribute', N'pH', N'7.5–8.5', 4),
    (N'p-molly-fish', N'attribute', N'Compatibility', N'Peaceful community', 5),
    (N'p-molly-fish', N'attribute', N'Care Level', N'Easy', 6),
    (N'p-molly-fish', N'attribute', N'Expected Lifespan', N'3–5 years', 7),
    (N'p-platy-fish', N'attribute', N'Fish Type', N'Platy', 0),
    (N'p-platy-fish', N'attribute', N'Size', N'2 in', 1),
    (N'p-platy-fish', N'attribute', N'Color', N'Assorted', 2),
    (N'p-platy-fish', N'attribute', N'Water Temperature', N'70–78°F', 3),
    (N'p-platy-fish', N'attribute', N'pH', N'7.0–8.0', 4),
    (N'p-platy-fish', N'attribute', N'Compatibility', N'Peaceful community', 5),
    (N'p-platy-fish', N'attribute', N'Care Level', N'Easy', 6),
    (N'p-platy-fish', N'attribute', N'Expected Lifespan', N'3–4 years', 7),
    (N'p-cichlid-pellets', N'attribute', N'Food Type', N'Sinking Pellet', 0),
    (N'p-cichlid-pellets', N'attribute', N'Weight', N'8.5 oz', 1),
    (N'p-cichlid-pellets', N'attribute', N'Fish Type', N'Cichlid', 2),
    (N'p-cichlid-pellets', N'attribute', N'Age Group', N'Adult', 3),
    (N'p-cichlid-pellets', N'attribute', N'Ingredients', N'Fish meal, krill meal, spirulina', 4),
    (N'p-algae-wafers', N'attribute', N'Food Type', N'Wafer', 0),
    (N'p-algae-wafers', N'attribute', N'Weight', N'5.29 oz', 1),
    (N'p-algae-wafers', N'attribute', N'Fish Type', N'Bottom Feeders', 2),
    (N'p-algae-wafers', N'attribute', N'Age Group', N'All Life Stages', 3),
    (N'p-algae-wafers', N'attribute', N'Ingredients', N'Spirulina, kelp, vegetable matter', 4),
    (N'p-moss-ball', N'attribute', N'Light Requirement', N'Low–Medium', 0),
    (N'p-moss-ball', N'attribute', N'Placement', N'Free-floating or substrate', 1),
    (N'p-moss-ball', N'attribute', N'Growth Rate', N'Very Slow', 2),
    (N'p-moss-ball', N'attribute', N'Care Level', N'Easy', 3),
    (N'p-wavemaker', N'attribute', N'Flow Rate', N'800–1600 GPH adjustable', 0),
    (N'p-wavemaker', N'attribute', N'Material', N'ABS/Magnet Mount', 1),
    (N'p-wavemaker', N'attribute', N'Brand', N'ReefTech', 2),
    (N'p-wavemaker', N'attribute', N'Power', N'10W', 3),
    (N'p-mini-heater', N'attribute', N'Capacity', N'Up to 10 gal', 0),
    (N'p-mini-heater', N'attribute', N'Wattage', N'25W', 1),
    (N'p-mini-heater', N'attribute', N'Material', N'Plastic Housing', 2),
    (N'p-mini-heater', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-clip-light', N'attribute', N'Capacity', N'Fits under 10 gal', 0),
    (N'p-clip-light', N'attribute', N'Spectrum', N'Daylight White', 1),
    (N'p-clip-light', N'attribute', N'Material', N'Aluminum/Plastic', 2),
    (N'p-clip-light', N'attribute', N'Brand', N'ReefTech', 3),
    (N'p-clip-light', N'attribute', N'Power', N'5W', 4),
    (N'p-background-poster', N'attribute', N'Material', N'Vinyl', 0),
    (N'p-background-poster', N'attribute', N'Dimensions', N'48 x 20 in', 1),
    (N'p-background-poster', N'attribute', N'Brand', N'GreenReef', 2),
    (N'p-fish-net', N'attribute', N'Material', N'Fine Nylon Mesh', 0),
    (N'p-fish-net', N'attribute', N'Handle Length', N'10 in', 1),
    (N'p-fish-net', N'attribute', N'Brand', N'ReefTech', 2),
    (N'p-neon-tetra', N'specification', N'Minimum Tank Size', N'10 gal', 0),
    (N'p-neon-tetra', N'specification', N'Diet', N'Omnivore', 1),
    (N'p-betta-fish', N'specification', N'Minimum Tank Size', N'5 gal', 0),
    (N'p-betta-fish', N'specification', N'Diet', N'Carnivore', 1),
    (N'p-fancy-goldfish', N'specification', N'Minimum Tank Size', N'20 gal', 0),
    (N'p-fancy-goldfish', N'specification', N'Diet', N'Omnivore', 1),
    (N'p-guppy', N'specification', N'Minimum Tank Size', N'10 gal', 0),
    (N'p-guppy', N'specification', N'Diet', N'Omnivore', 1),
    (N'p-angelfish', N'specification', N'Minimum Tank Size', N'29 gal', 0),
    (N'p-angelfish', N'specification', N'Diet', N'Omnivore', 1),
    (N'p-cory-catfish', N'specification', N'Minimum Tank Size', N'10 gal', 0),
    (N'p-cory-catfish', N'specification', N'Diet', N'Omnivore', 1),
    (N'p-tropical-flakes', N'specification', N'Feeding Frequency', N'1–2x daily', 0),
    (N'p-betta-pellets', N'specification', N'Feeding Frequency', N'2x daily', 0),
    (N'p-goldfish-food', N'specification', N'Feeding Frequency', N'1–2x daily', 0),
    (N'p-freeze-dried-brine', N'specification', N'Feeding Frequency', N'2–3x weekly (treat)', 0),
    (N'p-starter-kit-20', N'specification', N'Includes', N'Tank, filter, LED hood, conditioner sample', 0),
    (N'p-nano-tank-5', N'specification', N'Includes', N'Tank only', 0),
    (N'p-reef-tank-55', N'specification', N'Includes', N'Tank only', 0),
    (N'p-java-fern', N'specification', N'CO2 Required', N'No', 0),
    (N'p-anubias', N'specification', N'CO2 Required', N'No', 0),
    (N'p-amazon-sword', N'specification', N'CO2 Required', N'Beneficial, not required', 0),
    (N'p-canister-filter', N'specification', N'Media Included', N'Foam, ceramic rings, activated carbon', 0),
    (N'p-hob-filter', N'specification', N'Media Included', N'Replaceable cartridge', 0),
    (N'p-sponge-filter', N'specification', N'Requires', N'Air pump (sold separately)', 0),
    (N'p-air-pump', N'specification', N'Noise Level', N'Under 30 dB', 0),
    (N'p-water-pump', N'specification', N'Max Head Height', N'4.5 ft', 0),
    (N'p-aquarium-heater', N'specification', N'Temperature Range', N'68–93°F adjustable', 0),
    (N'p-led-light', N'specification', N'Timer', N'Built-in 24-hour timer', 0),
    (N'p-driftwood', N'specification', N'Pre-Treated', N'Yes — pre-soaked & sinks', 0),
    (N'p-rock-cave', N'specification', N'Safe For', N'Freshwater & saltwater', 0),
    (N'p-gravel-vacuum', N'specification', N'Best For', N'Tanks 10 gal and up', 0),
    (N'p-algae-scraper', N'specification', N'Best For', N'Glass tanks', 0),
    (N'p-water-conditioner', N'specification', N'Dosage', N'1 capful per 10 gal', 0),
    (N'p-fish-medicine', N'specification', N'Dosage', N'1 tsp per 10 gal, repeat per label', 0),
    (N'p-test-kit', N'specification', N'Format', N'Liquid reagent', 0),
    (N'p-stress-coat', N'specification', N'Use Case', N'New fish, water changes, injuries', 0),
    (N'p-molly-fish', N'specification', N'Minimum Tank Size', N'10 gal', 0),
    (N'p-molly-fish', N'specification', N'Diet', N'Omnivore', 1),
    (N'p-platy-fish', N'specification', N'Minimum Tank Size', N'10 gal', 0),
    (N'p-platy-fish', N'specification', N'Diet', N'Omnivore', 1),
    (N'p-cichlid-pellets', N'specification', N'Feeding Frequency', N'1–2x daily', 0),
    (N'p-algae-wafers', N'specification', N'Feeding Frequency', N'Daily', 0),
    (N'p-moss-ball', N'specification', N'CO2 Required', N'No', 0),
    (N'p-wavemaker', N'specification', N'Mount Type', N'Magnetic, tool-free', 0),
    (N'p-mini-heater', N'specification', N'Temperature', N'Preset 78°F', 0),
    (N'p-clip-light', N'specification', N'Mount Type', N'Clip-on gooseneck', 0),
    (N'p-background-poster', N'specification', N'Sides', N'Double-sided design', 0),
    (N'p-fish-net', N'specification', N'Net Size', N'4 x 3 in', 0);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.customers)
BEGIN
INSERT INTO dbo.customers (id, user_id, first_name, last_name, email, phone, status, registered_at)
VALUES
    (N'cust-admin', N'admin@aquashop.com', N'Ava', N'Sterling', N'admin@aquashop.com', N'+1 555-010-1000', N'Active', N'2025-01-10'),
    (N'cust-demo', N'jordan@example.com', N'Jordan', N'Pike', N'jordan@example.com', N'+1 555-010-2000', N'Active', N'2025-06-22'),
    (N'cust-2', N'alicia.ruiz@example.com', N'Alicia', N'Ruiz', N'alicia.ruiz@example.com', N'+1 555-010-2100', N'Active', N'2025-08-14'),
    (N'cust-3', N'devon.marsh@example.com', N'Devon', N'Marsh', N'devon.marsh@example.com', N'+1 555-010-2200', N'Active', N'2025-09-30'),
    (N'cust-4', N'morgan.lee@example.com', N'Morgan', N'Lee', N'morgan.lee@example.com', N'+1 555-010-2300', N'Inactive', N'2025-04-02');
END
GO

UPDATE c
SET c.user_id = u.id
FROM dbo.customers c
JOIN dbo.users u ON u.email = c.email
WHERE c.user_id IS NULL;
GO

IF NOT EXISTS (SELECT 1 FROM dbo.addresses)
BEGIN
INSERT INTO dbo.addresses (customer_id, full_name, phone, address_line, city, state, country, postal_code, is_default)
VALUES
    (N'cust-admin', N'Ava Sterling', N'+1 555-010-1000', N'100 Harbor View Way', N'Seattle', N'WA', N'USA', N'98101', 1),
    (N'cust-demo', N'Jordan Pike', N'+1 555-010-2000', N'482 Tidewater Ave', N'Portland', N'OR', N'USA', N'97201', 1),
    (N'cust-2', N'Alicia Ruiz', N'+1 555-010-2100', N'19 Coral Lane', N'Austin', N'TX', N'USA', N'73301', 1),
    (N'cust-3', N'Devon Marsh', N'+1 555-010-2200', N'77 Reef Street', N'Miami', N'FL', N'USA', N'33101', 1),
    (N'cust-4', N'Morgan Lee', N'+1 555-010-2300', N'5 Kelp Court', N'San Diego', N'CA', N'USA', N'92101', 1);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.banners)
BEGIN
INSERT INTO dbo.banners (id, title, subtitle, description, image, button_text, button_link, start_date, end_date, active, display_order)
VALUES
    (N'ban-1', N'Dive Into Your Perfect Aquarium', N'Premium fish, tanks & gear', N'Everything your aquatic world needs, curated for beginners and experts alike.', N'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=1600&q=80', N'Shop Fish', N'/category/fish', N'2026-01-01', N'2026-12-31', 1, 1),
    (N'ban-2', N'Starter Kits, Ready to Launch', N'Everything in one box', N'Tank, filter, light, and conditioner — set up your first aquarium in an afternoon.', N'https://images.unsplash.com/photo-1520302519104-c452c2eddb56?w=1600&q=80', N'Explore Kits', N'/category/aquarium-tanks', N'2026-01-01', N'2026-12-31', 1, 2),
    (N'ban-3', N'Live Plants, Instant Aquascape', N'Low-light & beginner friendly', N'Java Fern, Anubias, and Amazon Sword ready to root in your tank this week.', N'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=1600&q=80', N'Shop Plants', N'/category/aquarium-plants', N'2026-01-01', N'2026-12-31', 1, 3),
    (N'ban-4', N'Winter Water-Quality Sale', N'Up to 20% off filtration', N'Keep your tank crystal clear with discounted filters and conditioners this month.', N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1600&q=80', N'View Offers', N'/offers', N'2026-01-01', N'2026-03-31', 1, 4),
    (N'ban-5', N'New: Fish Care Library', N'Learn before you buy', N'Guides on cycling, compatibility, and water quality from our in-house aquarists.', N'https://images.unsplash.com/photo-1522911512095-8ce38fbc37e6?w=1600&q=80', N'Read Guides', N'/fish-care', N'2026-01-01', N'2026-12-31', 1, 5);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.offers)
BEGIN
INSERT INTO dbo.offers (id, title, description, type, discount_percent, coupon_code, start_date, end_date, active, display_order)
VALUES
    (N'off-1', N'Starter Kit Flash Sale', N'20% off all-in-one aquarium starter kits this week only.', N'flash-sale', 20, NULL, N'2026-09-01', N'2026-09-30', 1, 0),
    (N'off-2', N'Lighting Upgrade Sale', N'Save on full-spectrum LED lighting for planted tanks.', N'seasonal', 18, NULL, N'2026-09-01', N'2026-10-15', 1, 1),
    (N'off-3', N'Fish Care Essentials Bundle', N'Bundle a test kit, conditioner, and stress coat for one low price.', N'bundle', 15, NULL, N'2026-08-15', N'2026-12-01', 1, 2),
    (N'off-4', N'Welcome Coupon', N'New customers save 10% on their first order with code AQUA10.', N'coupon', 10, N'AQUA10', N'2026-01-01', N'2026-12-31', 1, 3),
    (N'off-5', N'Plant Lovers Sale', N'Discounts across live aquarium plants for a lush aquascape.', N'seasonal', 12, NULL, N'2026-09-01', N'2026-09-20', 1, 4);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.offer_products)
BEGIN
INSERT INTO dbo.offer_products (offer_id, product_id)
VALUES
    (N'off-1', N'p-starter-kit-20'),
    (N'off-2', N'p-led-light'),
    (N'off-3', N'p-test-kit'),
    (N'off-3', N'p-water-conditioner'),
    (N'off-3', N'p-stress-coat');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.offer_categories)
BEGIN
INSERT INTO dbo.offer_categories (offer_id, category_id)
VALUES
    (N'off-5', N'cat-plants');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blog_posts)
BEGIN
INSERT INTO dbo.blog_posts (id, title, slug, description, content, image, category, author, status, published_date)
VALUES
    (N'blog-1', N'How to Set Up Your First Aquarium', N'how-to-set-up-your-first-aquarium', N'A step-by-step walkthrough for a stress-free first setup, from substrate to your first fish.', N'Setting up your first aquarium starts with choosing the right size tank for your space and goals. Rinse substrate and hardscape before adding them, fill with dechlorinated water, and install your filter and heater before anything else. Let the tank run for a few days to stabilize temperature, then begin cycling before adding fish.', N'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=1200&q=80', N'Getting Started', N'Maya Chen', N'Published', N'2026-01-05'),
    (N'blog-2', N'Understanding the Nitrogen Cycle', N'understanding-the-nitrogen-cycle', N'Why "cycling" your tank matters and how to do it safely before adding fish.', N'The nitrogen cycle converts toxic ammonia from fish waste into nitrite, then into far less harmful nitrate. Beneficial bacteria that perform this conversion take several weeks to establish, which is why patience before fully stocking a new tank prevents "new tank syndrome" and fish loss.', N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1200&q=80', N'Water Quality', N'Dr. Owen Reyes', N'Published', N'2026-01-12'),
    (N'blog-3', N'How Often Should You Feed Your Fish?', N'how-often-should-you-feed-your-fish', N'Overfeeding is the most common beginner mistake — here is how to get portions right.', N'Most tropical fish do well with small portions once or twice a day, eaten completely within two minutes. Uneaten food breaks down and spikes ammonia, so it is safer to underfeed slightly than overfeed. Consider a weekly fasting day to mimic natural feeding patterns.', N'https://images.unsplash.com/photo-1596797882870-8c33deeaaa8e?w=1200&q=80', N'Feeding', N'Maya Chen', N'Published', N'2026-01-19'),
    (N'blog-4', N'A Beginner’s Guide to Fish Compatibility', N'beginners-guide-to-fish-compatibility', N'Which species get along, and which combinations to avoid in a community tank.', N'Compatibility depends on temperament, size, and water parameter needs. Peaceful schoolers like Neon Tetras and Corydoras mix well together, while fin-nippers or territorial cichlids need more careful planning. Always research adult size, not just the size at purchase.', N'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=1200&q=80', N'Fish Care', N'Priya Nair', N'Published', N'2026-01-26'),
    (N'blog-5', N'Cleaning Your Aquarium Without Stressing Your Fish', N'cleaning-your-aquarium-without-stressing-fish', N'A gentle, effective routine for weekly and monthly aquarium maintenance.', N'Weekly partial water changes of 10-20% remove waste without disturbing beneficial bacteria. Vacuum the substrate gently, rinse filter media in removed tank water (never tap water), and avoid scrubbing every surface at once — a partially undisturbed biofilm keeps your cycle stable.', N'https://images.unsplash.com/photo-1584967911318-3ce0dd6f4ca0?w=1200&q=80', N'Maintenance', N'Dr. Owen Reyes', N'Published', N'2026-02-02'),
    (N'blog-6', N'Choosing the Right Light for a Planted Tank', N'choosing-right-light-planted-tank', N'How to match your lighting to your plants without fueling an algae bloom.', N'Low-light plants like Java Fern and Anubias thrive under modest LED output, while stem plants and carpeting species need stronger, full-spectrum fixtures. Start with 6-8 hours of light per day and adjust based on algae growth rather than guessing at wattage alone.', N'https://images.unsplash.com/photo-1544923246-77307dd654cb?w=1200&q=80', N'Plants', N'Priya Nair', N'Published', N'2026-02-09'),
    (N'blog-7', N'Betta Fish Care 101', N'betta-fish-care-101', N'What every new Betta owner should know about tank size, temperature, and tankmates.', N'Despite their reputation as "low-maintenance," Bettas do best in heated, filtered tanks of at least 5 gallons — not bowls. They are generally solitary and should not be housed with fin-nipping species or other Bettas.', N'https://images.unsplash.com/photo-1520302659201-63bdcc245f4d?w=1200&q=80', N'Fish Care', N'Maya Chen', N'Published', N'2026-02-16'),
    (N'blog-8', N'Signs of a Healthy vs. Stressed Fish', N'signs-healthy-vs-stressed-fish', N'Learn to read body language, color, and behavior before problems become serious.', N'Healthy fish display steady color, active swimming, and normal appetite. Watch for clamped fins, rapid gilling, hiding, or color loss, which often signal poor water quality or early illness — testing water parameters is usually the first diagnostic step.', N'https://images.unsplash.com/photo-1522911512095-8ce38fbc37e6?w=1200&q=80', N'Fish Care', N'Dr. Owen Reyes', N'Published', N'2026-02-23'),
    (N'blog-9', N'Freshwater vs. Saltwater: Which Is Right for You?', N'freshwater-vs-saltwater-which-right-for-you', N'Comparing cost, maintenance, and difficulty before choosing your first tank type.', N'Freshwater tanks are generally more forgiving and less expensive to start, making them the recommended path for beginners. Saltwater and reef tanks offer stunning color and biodiversity but demand tighter water parameter control and specialized equipment.', N'https://images.unsplash.com/photo-1499242611767-cf8b9be02854?w=1200&q=80', N'Getting Started', N'Priya Nair', N'Published', N'2026-03-02'),
    (N'blog-10', N'Aquascaping Basics: Building Your First Layout', N'aquascaping-basics-first-layout', N'Simple design principles for a natural-looking tank using rocks, wood, and plants.', N'Odd-numbered groupings of hardscape, a clear focal point, and varying plant heights front-to-back create depth in even a small tank. Start with two or three types of plants and one hardscape material before adding complexity.', N'https://images.unsplash.com/photo-1520301255226-bf5f144451c1?w=1200&q=80', N'Plants', N'Maya Chen', N'Published', N'2026-03-09'),
    (N'blog-11', N'Quarantining New Fish the Right Way', N'quarantining-new-fish-right-way', N'Why a quarantine tank protects your whole collection from disease outbreaks.', N'A simple 10-20 gallon quarantine tank with a sponge filter and heater lets you observe new arrivals for 2-4 weeks before introducing them to your main display, catching parasites or disease before they spread.', N'https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?w=1200&q=80', N'Fish Care', N'Dr. Owen Reyes', N'Published', N'2026-03-16');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.blog_post_tags)
BEGIN
INSERT INTO dbo.blog_post_tags (post_id, tag)
VALUES
    (N'blog-1', N'beginner'),
    (N'blog-1', N'setup'),
    (N'blog-2', N'cycling'),
    (N'blog-2', N'water-quality'),
    (N'blog-3', N'feeding'),
    (N'blog-3', N'care'),
    (N'blog-4', N'compatibility'),
    (N'blog-4', N'community-tank'),
    (N'blog-5', N'maintenance'),
    (N'blog-5', N'water-change'),
    (N'blog-6', N'lighting'),
    (N'blog-6', N'plants'),
    (N'blog-7', N'betta'),
    (N'blog-7', N'care-guide'),
    (N'blog-8', N'health'),
    (N'blog-8', N'observation'),
    (N'blog-9', N'freshwater'),
    (N'blog-9', N'saltwater'),
    (N'blog-10', N'aquascaping'),
    (N'blog-10', N'design'),
    (N'blog-11', N'quarantine'),
    (N'blog-11', N'disease-prevention');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.reviews)
BEGIN
INSERT INTO dbo.reviews (id, product_id, customer_id, customer_name, avatar, rating, title, comment, verified_purchase, status, created_at)
VALUES
    (N'rev-1', N'p-neon-tetra', NULL, N'Jordan P.', NULL, 5, N'So vibrant!', N'Arrived healthy and active, color is even better than the photos.', 1, N'Approved', N'2026-02-01'),
    (N'rev-2', N'p-neon-tetra', NULL, N'Sam K.', NULL, 4, N'Great schooling fish', N'Lost one in transit but the rest are thriving two months later.', 1, N'Approved', N'2026-01-18'),
    (N'rev-3', N'p-betta-fish', NULL, N'Alicia R.', NULL, 5, N'Gorgeous fins', N'My betta has the most incredible color, very active eater.', 1, N'Approved', N'2026-02-10'),
    (N'rev-4', N'p-starter-kit-20', NULL, N'Devon M.', NULL, 5, N'Perfect first tank', N'Everything I needed in one box, filter is much quieter than expected.', 1, N'Approved', N'2026-01-25'),
    (N'rev-5', N'p-starter-kit-20', NULL, N'Taylor S.', NULL, 4, N'Good value', N'Light is a bit dim for a planted tank but great for fish only.', 0, N'Approved', N'2026-02-05'),
    (N'rev-6', N'p-java-fern', NULL, N'Morgan L.', NULL, 5, N'Thriving after a month', N'Attached it to driftwood and it took root beautifully, zero issues.', 1, N'Approved', N'2026-02-12'),
    (N'rev-7', N'p-canister-filter', NULL, N'Chris B.', NULL, 5, N'Powerful and quiet', N'Water clarity improved within two days, barely hear it running.', 1, N'Approved', N'2026-01-30'),
    (N'rev-8', N'p-led-light', NULL, N'Riley T.', NULL, 5, N'Plants love it', N'Noticeable new growth within a week of switching to this light.', 1, N'Approved', N'2026-02-14'),
    (N'rev-9', N'p-water-conditioner', NULL, N'Jamie F.', NULL, 5, N'Always in my cart', N'Been using this brand for years, never had an issue with tap water.', 1, N'Approved', N'2026-02-08'),
    (N'rev-10', N'p-test-kit', NULL, N'Casey W.', NULL, 5, N'Essential purchase', N'Way more accurate than strips, lasts a very long time.', 1, N'Approved', N'2026-01-22'),
    (N'rev-11', N'p-aquarium-heater', NULL, N'Drew H.', NULL, 4, N'Holds temperature well', N'Steady at 78 degrees for weeks now, dial could be a bit more precise.', 1, N'Approved', N'2026-02-03'),
    (N'rev-12', N'p-angelfish', NULL, N'Quinn A.', NULL, 5, N'Beautiful centerpiece fish', N'Graceful and calm, gets along great with my tetras.', 1, N'Approved', N'2026-02-16');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.homepage_sections)
BEGIN
INSERT INTO dbo.homepage_sections (id, type, title, subtitle, enabled, display_order)
VALUES
    (N'sec-hero', N'hero', N'Dive Into Your Perfect Aquarium', N'Everything your aquatic world needs.', 1, 1),
    (N'sec-categories', N'categories', N'Shop by Category', NULL, 1, 2),
    (N'sec-featured', N'featured-products', N'Featured Products', NULL, 1, 3),
    (N'sec-new-arrivals', N'new-arrivals', N'New Arrivals', NULL, 1, 4),
    (N'sec-promo', N'promotion', N'Winter Water-Quality Sale', N'Up to 20% off filtration', 1, 5),
    (N'sec-best-sellers', N'best-sellers', N'Best Sellers', NULL, 1, 6),
    (N'sec-why-us', N'why-us', N'Why Choose AquaShop', NULL, 1, 7),
    (N'sec-reviews', N'reviews', N'What Aquarists Are Saying', NULL, 1, 8),
    (N'sec-blog', N'blog', N'From the Fish Care Library', NULL, 1, 9),
    (N'sec-newsletter', N'newsletter', N'Stay in the Current', N'Tips, offers, and new arrivals in your inbox.', 1, 10);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.settings)
BEGIN
INSERT INTO dbo.settings (setting_key, setting_value, description)
VALUES
    (N'storeName', N'N''AquaShop''', N'Store name'),
    (N'logo', N'N''''', N'Store logo URL'),
    (N'email', N'N''hello@aquashop.com''', N'Contact email'),
    (N'phone', N'N''+1 (800) 555-0142''', N'Contact phone'),
    (N'address', N'N''100 Harbor View Way, Seattle, WA 98101''', N'Store address'),
    (N'businessHours', N'N''Mon–Fri 9am–6pm, Sat 10am–4pm PST''', N'Opening hours'),
    (N'currency', N'N''NPR''', N'ISO currency code'),
    (N'currencySymbol', N'N''Rs.''', N'Currency symbol'),
    (N'taxRatePercent', N'7', N'Tax rate %'),
    (N'shippingFee', N'5.99', N'Flat shipping fee'),
    (N'freeShippingThreshold', N'75', N'Free shipping threshold'),
    (N'maintenanceMode', N'0', N'Maintenance mode'),
    (N'registrationEnabled', N'1', N'Customer registration enabled'),
    (N'reviewsEnabled', N'1', N'Reviews enabled'),
    (N'wishlistEnabled', N'1', N'Wishlist enabled'),
    (N'socialLinks.facebook', N'N''https://facebook.com/aquashop''', N'Facebook profile URL'),
    (N'socialLinks.instagram', N'N''https://instagram.com/aquashop''', N'Instagram profile URL'),
    (N'socialLinks.youtube', N'N''https://youtube.com/@aquashop''', N'Youtube profile URL'),
    (N'socialLinks.tiktok', N'N''https://tiktok.com/@aquashop''', N'Tiktok profile URL');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.orders)
BEGIN
INSERT INTO dbo.orders (id, order_number, customer_id, customer_name, customer_email, status, payment_status, payment_method, delivery_method, subtotal, discount, shipping_fee, tax, grand_total, coupon_code, placed_at, estimated_delivery)
VALUES
    (N'ord-1', N'AQ-100234', N'cust-demo', N'Jordan Pike', N'jordan@example.com', N'Delivered', N'Paid', N'Credit/Debit Card', N'Standard Delivery', 40.92, 0, 5.99, 2.87, 49.78, NULL, N'2026-01-10', N'2026-01-16'),
    (N'ord-2', N'AQ-100301', N'cust-demo', N'Jordan Pike', N'jordan@example.com', N'Shipped', N'Paid', N'Digital Wallet', N'Express Delivery', 104.99, 10.50, 12.99, 6.83, 114.31, N'AQUA10', N'2026-02-14', N'2026-02-17'),
    (N'ord-3', N'AQ-100355', N'cust-2', N'Alicia Ruiz', N'alicia.ruiz@example.com', N'Processing', N'Unpaid', N'Cash on Delivery', N'Standard Delivery', 19.48, 0, 5.99, 1.36, 26.83, NULL, N'2026-02-20', N'2026-02-26'),
    (N'ord-4', N'AQ-100402', N'cust-3', N'Devon Marsh', N'devon.marsh@example.com', N'Pending', N'Paid', N'Credit/Debit Card', N'Store Pickup', 89.99, 0, 0, 6.30, 96.29, NULL, N'2026-03-01', N'2026-03-04');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.order_items)
BEGIN
INSERT INTO dbo.order_items (order_id, product_id, sku, name, image, unit_price, quantity, line_total)
VALUES
    (N'ord-1', N'p-neon-tetra', NULL, N'Neon Tetra', N'https://images.unsplash.com/photo-1520302519104-c452c2eddb56?w=400&q=80', 4.49, 6, 26.94),
    (N'ord-1', N'p-java-fern', NULL, N'Java Fern', N'https://images.unsplash.com/photo-1524683079666-091ec38e2c78?w=400&q=80', 6.99, 2, 13.98),
    (N'ord-2', N'p-starter-kit-20', NULL, N'Aquarium Starter Kit (20 Gal)', N'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400&q=80', 104.99, 1, 104.99),
    (N'ord-3', N'p-betta-fish', NULL, N'Betta Fish', N'https://images.unsplash.com/photo-1524704796725-9fc3044a58b2?w=400&q=80', 12.99, 1, 12.99),
    (N'ord-3', N'p-betta-pellets', NULL, N'Betta Pellets', N'https://images.unsplash.com/photo-1584967911318-3ce0dd6f4ca0?w=400&q=80', 6.49, 1, 6.49),
    (N'ord-4', N'p-canister-filter', NULL, N'External Canister Filter', N'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80', 89.99, 1, 89.99);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.order_status_history)
BEGIN
INSERT INTO dbo.order_status_history (order_id, status, note, changed_by)
VALUES
    (N'ord-1', N'Pending', NULL, NULL),
    (N'ord-1', N'Confirmed', NULL, NULL),
    (N'ord-1', N'Processing', NULL, NULL),
    (N'ord-1', N'Packed', NULL, NULL),
    (N'ord-1', N'Shipped', NULL, NULL),
    (N'ord-1', N'Delivered', NULL, NULL),
    (N'ord-2', N'Pending', NULL, NULL),
    (N'ord-2', N'Confirmed', NULL, NULL),
    (N'ord-2', N'Processing', NULL, NULL),
    (N'ord-2', N'Packed', NULL, NULL),
    (N'ord-2', N'Shipped', NULL, NULL),
    (N'ord-3', N'Pending', NULL, NULL),
    (N'ord-3', N'Confirmed', NULL, NULL),
    (N'ord-3', N'Processing', NULL, NULL),
    (N'ord-4', N'Pending', NULL, NULL);
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.inventory_log)
BEGIN
INSERT INTO dbo.inventory_log (product_id, change_quantity, new_quantity, reason, user_id, created_at)
VALUES
    (N'p-neon-tetra', 100, 86, N'Initial stock count', NULL, N'2025-11-02'),
    (N'p-betta-fish', 50, 40, N'Initial stock count', NULL, N'2026-01-15'),
    (N'p-fancy-goldfish', 40, 30, N'Initial stock count', NULL, N'2025-09-20');
END
GO

IF NOT EXISTS (SELECT 1 FROM dbo.audit_logs)
BEGIN
INSERT INTO dbo.audit_logs (user_id, action, entity, entity_id, details, ip_address, created_at)
VALUES
    (NULL, N'seed', N'system', NULL, N'Database seeded from AquaShop mock catalog', NULL, N'2025-01-10');
END
GO


-- ── Access-control helpers ─────────────────────────────────────────────────
-- Every admin API/page should check a permission before it reads or writes.

GO
CREATE VIEW dbo.vw_user_roles AS
SELECT u.id AS user_id, u.email, r.id AS role_id, r.name AS role_name
FROM dbo.users u
JOIN dbo.user_roles ur ON ur.user_id = u.id
JOIN dbo.roles r      ON r.id = ur.role_id;
GO

CREATE VIEW dbo.vw_user_permissions AS
SELECT ur.user_id, p.code, p.name, p.module
FROM dbo.user_roles ur
JOIN dbo.role_permissions rp ON rp.role_id = ur.role_id
JOIN dbo.permissions p       ON p.id = rp.permission_id;
GO

-- Returns 1 when the user holds @permission_code through any of their roles.
CREATE FUNCTION dbo.fn_user_has_permission (@user_id UNIQUEIDENTIFIER, @permission_code NVARCHAR(100))
RETURNS BIT
AS
BEGIN
    IF EXISTS (SELECT 1 FROM dbo.vw_user_permissions WHERE user_id = @user_id AND code = @permission_code)
        RETURN 1;
    RETURN 0;
END;
GO

-- Pages the user is allowed to open (used to build the admin sidebar/menu).
CREATE FUNCTION dbo.fn_user_pages (@user_id UNIQUEIDENTIFIER)
RETURNS TABLE
AS
RETURN
(
    SELECT pg.id, pg.name, pg.route, pg.icon, pg.display_order, pg.permission_code
    FROM dbo.pages pg
    WHERE pg.is_active = 1
      AND dbo.fn_user_has_permission(@user_id, pg.permission_code) = 1
);
GO

-- Read-only view used by the admin panel.
CREATE VIEW dbo.vw_customer_directory AS
SELECT c.id, c.first_name, c.last_name, c.email, c.phone, c.status, c.registered_at,
       u.id AS user_id,
       (SELECT COUNT(1) FROM dbo.orders o WHERE o.customer_id = c.id)      AS order_count,
       (SELECT ISNULL(SUM(o.grand_total), 0) FROM dbo.orders o WHERE o.customer_id = c.id) AS total_spent
FROM dbo.customers c
LEFT JOIN dbo.users u ON u.id = c.user_id;
GO

CREATE VIEW dbo.vw_product_catalog AS
SELECT p.*, c.name AS category_name, c.slug AS category_slug,
       ISNULL(p.sale_price, p.price) AS effective_price,
       CASE WHEN p.stock_quantity <= 0 THEN 'Out of Stock'
            WHEN p.stock_quantity <= p.minimum_stock THEN 'Low Stock'
            ELSE 'In Stock' END AS stock_status
FROM dbo.products p
JOIN dbo.categories c ON c.id = p.category_id;
GO

-- Convenience: list the permission codes a user has.
--   SELECT code FROM dbo.vw_user_permissions WHERE user_id = '...';
-- Page menu for a user:
--   SELECT * FROM dbo.fn_user_pages('...');
-- Guard a page:
--   IF dbo.fn_user_has_permission(@userId, 'products.edit') = 1 ...
