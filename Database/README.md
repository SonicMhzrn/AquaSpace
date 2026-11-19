# AquaShop database (SQL Server)

`aquashop.sql` is the full, self-contained script: schema, RBAC, seed data and
access-control helpers. It was generated from the app's mock catalog, so the
seeded products, categories, orders, reviews and content are the same records
the Angular app already uses (same ids, slugs and SKUs — the frontend can be
pointed at the API without remapping anything).

## 1. Connection

Pick the connection string that matches your machine and put it in
`appsettings.json` → `ConnectionStrings:DefaultConnection`:

| Setup | Connection string |
| --- | --- |
| Local SQL Server | `Server=localhost;Database=AquaShop;Trusted_Connection=True;TrustServerCertificate=True` |
| SQL Server Express | `Server=.\SQLEXPRESS;Database=AquaShop;Trusted_Connection=True;TrustServerCertificate=True` |
| LocalDB | `Server=(localdb)\MSSQLLocalDB;Database=AquaShop;Trusted_Connection=True` |
| Docker (`mssql-server`) | `Server=localhost,1433;Database=AquaShop;User Id=sa;Password=Your_strong_Password1;TrustServerCertificate=True` |

The script creates the `AquaShop` database if it does not exist, so there is no
manual "create database" step.

## 2. Run it

Open `aquashop.sql` in **SQL Server Management Studio (SSMS)** or **Azure Data
Studio** and run the whole file (F5). It is safe to run more than once: every
seed block is wrapped in `IF NOT EXISTS (...)`, so a second run is a no-op.

## 3. Login accounts

Passwords are stored as SHA-256 hex in `users.password_hash` for the demo
(the app currently compares plaintext — move to ASP.NET Identity / PBKDF2 when
the real API lands).

| Role | Email | Password | Can see |
| --- | --- | --- | --- |
| Administrator | `admin@aquashop.com` | `Admin@123` | every admin page |
| Manager | `priya@aquashop.com` | `Manager@123` | catalog, inventory, orders, content, settings (read) |
| Support | `support@aquashop.com` | `Support@123` | orders, customers, reviews |
| Customer | `jordan@example.com` | `Demo@123` | storefront only — no admin pages |

Extra seeded customers: `alicia.ruiz@example.com`, `devon.marsh@example.com`,
`morgan.lee@example.com` (password `Password1`).

## 4. Schema overview (30 tables)

| Area | Tables |
| --- | --- |
| Identity / RBAC | `users`, `roles`, `permissions`, `user_roles`, `role_permissions`, `pages` |
| Catalog | `categories`, `products`, `product_images`, `product_tags`, `product_badges`, `product_attributes` |
| Customers | `customers`, `addresses`, `cart_items`, `wishlist_items` |
| Orders | `orders`, `order_items`, `order_status_history` |
| Marketing | `banners`, `offers`, `offer_products`, `offer_categories` |
| Content | `blog_posts`, `blog_post_tags`, `reviews`, `homepage_sections`, `settings` |
| Ops | `inventory_log`, `audit_logs` |

Useful indexes are included (FK columns, `orders(status)`, `products(is_active)`
with included columns, filtered index on featured products).

## 5. RBAC model

```
users ──< user_roles >── roles ──< role_permissions >── permissions
                                                        │
pages ──────────────────────────────────────────────────┘
(page requires one permission code)
```

* **Permissions** are granular codes such as `products.create`, `orders.update`,
  `reviews.moderate`, `settings.edit` (34 total, seeded).
* **Roles** are collections of permissions. `Administrator` has all 34;
  `Manager` has 26 (no user/role management, no destructive deletes, no
  settings write); `Support` has 10; `Customer` has none.
* **Pages** are the admin screens. Each page points at the permission needed to
  open it, so the menu is data-driven: add a page + permission row instead of
  hard-coding routes.

### Enforcing a permission

```sql
-- Does this user hold a permission (through any role)?
SELECT dbo.fn_user_has_permission(@userId, 'products.edit');   -- 1 = allowed

-- Which admin pages can this user open? Feed this to the sidebar.
SELECT * FROM dbo.fn_user_pages(@userId);

-- Everything a user can do:
SELECT code, name, module FROM dbo.vw_user_permissions WHERE user_id = @userId;
```

On the API side, put the same check in an authorization handler/filter and
have the Angular admin hide or disable menu entries that are not returned by
`fn_user_pages` — the backend check is the one that must never be skipped.

## 6. Handy queries

```sql
-- Catalog with computed stock status
SELECT * FROM dbo.vw_product_catalog WHERE stock_status = 'Low Stock';

-- Customer directory with order stats
SELECT * FROM dbo.vw_customer_directory ORDER BY total_spent DESC;

-- Orders with items
SELECT o.order_number, o.customer_name, o.status, o.grand_total,
       i.name, i.quantity, i.line_total
FROM dbo.orders o
JOIN dbo.order_items i ON i.order_id = o.id
ORDER BY o.placed_at DESC;

-- Effective price + stock for the storefront
SELECT id, slug, name, price, ISNULL(sale_price, price) AS effective_price,
       stock_quantity
FROM dbo.vw_product_catalog
WHERE is_active = 1
ORDER BY created_at DESC;
```

## 7. Notes / next steps

* `reviews.customer_id` is nullable because the mock reviews only carry a name;
  link it to `customers` as soon as real reviews come from registered users.
* `cart_items` supports both a logged-in user and an anonymous `session_id`
  (guests keep a cart before login).
* `settings` is a key/value table, so adding a setting needs no schema change.
* `inventory_log` and `audit_logs` are write targets: call them from the API
  whenever stock is adjusted or an admin mutates a record.
