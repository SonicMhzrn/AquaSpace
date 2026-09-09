# AquaShop — Premium Aquarium E-Commerce (Angular 18)

A full-stack-ready, frontend-only e-commerce storefront and admin dashboard for an aquarium shop, built with Angular 18, TypeScript, and Tailwind CSS. All data is mock data persisted to `localStorage`, structured so it can be swapped for a real ASP.NET Core API later with minimal component changes.

---

## 1. Project Overview

AquaShop sells fish, fish food, tanks, plants, filtration, lighting, decorations, cleaning equipment, and fish care products. It includes:

- A full customer storefront (home, category browsing, product details, cart, wishlist, checkout, auth, profile, orders, offers, blog, fish care library, about/contact)
- A separate, fully functional admin panel (dashboard, product/category/inventory/order/customer/banner/offer/blog/review/homepage/settings management)
- Ocean-themed design system built entirely in Tailwind CSS (no SCSS, no Bootstrap)

---

## 2. Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+

## 3. Installation

```bash
npm install
```

## 4. Development Server

```bash
npm start
```

Navigate to `http://localhost:4200/`. The app reloads automatically on file changes.

## 5. Production Build

```bash
npm run build
```

Output is written to `dist/aquarium-ecommerce/`.

---

## 6. Demo Accounts

| Role     | Email                | Password    |
|----------|-----------------------|-------------|
| Admin    | admin@aquashop.com    | Admin@123   |
| Customer | jordan@example.com    | Demo@123    |

Login page also has one-click "Use Demo Admin / Customer" buttons.

---

## 7. Project Architecture

```
Angular Components
        ↓
Angular Services (signals-based state)
        ↓
Mock Data (core/mock-data/*.data.ts)
        ↓
StorageService → localStorage
```

Components never touch `localStorage` or mock data directly — they only call services. Services expose Angular **signals** for reactive state (`products()`, `cartSvc.items()`, etc.), so admin writes (e.g. changing a product's price or deactivating it) immediately reflect on customer-facing pages with no manual refresh, because both read the same underlying signal.

### Folder structure

```
src/app/
├── core/
│   ├── guards/        # authGuard, adminGuard
│   ├── interceptors/  # api-prefix, loading
│   ├── models/        # TypeScript interfaces (Product, Order, Customer, etc.)
│   ├── mock-data/      # centralized seed data (products, categories, banners, etc.)
│   └── services/       # ProductService, CartService, AuthService, OrderService, ...
├── shared/
│   ├── components/     # Header, Footer, ProductCard, AdminSidebar, etc.
│   └── services/       # ToastService, ConfirmDialogService
├── features/
│   ├── home, products, categories, cart, checkout, wishlist,
│   │   auth, profile, orders, offers, about, contact, blog,
│   │   fish-care, not-found
│   └── admin/           # dashboard, products, categories, orders, inventory,
│                          customers, banners, offers, blog, reviews, homepage, settings
├── app.routes.ts        # all customer + admin routes (lazy-loaded)
└── app.component.ts     # root shell (hides customer header/footer on /admin routes)
```

---

## 8. Tailwind / Styling

- **Tailwind CSS only** — no SCSS files exist anywhere in the project, no Bootstrap.
- Custom ocean design tokens live in `tailwind.config.js`:
  - `abyss` — deep navy/ocean tones (headers, footers, admin sidebar)
  - `tide` — aqua/teal accent (buttons, links, badges, focus rings)
  - `seafoam` — light accent tone
  - Custom gradients: `bg-depth-gradient`, `bg-tide-gradient`, `bg-surface-glow`
  - Custom shadows: `shadow-deep`, `shadow-glow`
  - Custom animations: `animate-drift`, `animate-rise` (used for hero bubble decorations)
- Fonts: **Fraunces** (display/headings) + **Inter** (body), loaded via Google Fonts `<link>` tags in `index.html`.
- `src/styles.css` contains only the three `@tailwind` layer directives plus a few global base rules (scrollbar styling, focus-visible outline, selection color) — everything else is inline Tailwind utility classes in component templates.

---

## 9. Mock Data & LocalStorage Architecture

All mock data lives in `src/app/core/mock-data/*.data.ts` as typed constant arrays — nothing is hardcoded inside components. On first load, `StorageService.seed()` copies this data into `localStorage` under the `aquashop:` key prefix (e.g. `aquashop:products`, `aquashop:cart`). After that, all reads/writes go through `localStorage`, so:

- Admin edits (price changes, deactivating a product, updating a banner, etc.) persist across reloads.
- Customer actions (cart, wishlist, placed orders, registered accounts) persist across reloads.
- To reset all demo data, clear `localStorage` for the site (or call `StorageService.clearAll()` from the browser console).

---

## 10. Dynamic Category System

`Fish` and `Fish Food` are top-level categories. Every other product type (Tanks, Plants, Filters, Air Pumps, Water Pumps, Heaters, Lighting, Decorations, Cleaning Equipment, Fish Care) is a **subcategory of `Accessories`**. Category pages are fully dynamic via the single `/category/:slug` route — there are no hardcoded per-category components. Visiting a parent category (e.g. `/category/accessories`) shows products across all its subcategories; visiting a subcategory directly (e.g. `/category/filters`) scopes to just that subcategory.

---

## 11. Admin ⇄ Customer Sync

Because both admin and customer components read from the same Angular signals (backed by the same `localStorage` keys), any admin change is immediately visible to customers without a page refresh in the same session, and persists for all sessions after that:

- Change a product's price/stock/active status in **Admin → Products** → reflected instantly on the product card, product detail page, and any listing.
- Toggle a homepage section in **Admin → Homepage** → the homepage re-renders that section (or hides it) on next paint.
- Update store settings (tax rate, shipping fee, currency) in **Admin → Settings** → cart and checkout totals recalculate using the new values immediately.

---

## 12. Future .NET API Integration

Every service in `core/services/` currently does something like:

```typescript
getAll(): Observable<Product[]> {
  return of(this.activeProducts()).pipe(delay(150));
}
```

To integrate a real ASP.NET Core backend, you would:

1. Set `environment.apiUrl` (in `src/environments/environment.ts` / `.prod.ts`) to your API's base URL.
2. Replace the body of each service method with an `HttpClient` call, e.g.:

   ```typescript
   getAll(): Observable<Product[]> {
     return this.http.get<Product[]>('/products');
   }
   ```

   The existing `apiPrefixInterceptor` (in `core/interceptors/api-prefix.interceptor.ts`) already prepends `environment.apiUrl` to any relative URL, so no path changes are needed elsewhere.
3. Remove the corresponding `localStorage` seed/persist calls from that service (the backend becomes the source of truth).
4. Components are unaffected — they already consume services through Angular signals/Observables, not raw data structures.

Planned REST endpoints (see the original spec) map 1:1 to the current service methods: `GET/POST/PUT/DELETE /api/products`, `/api/categories`, `/api/orders`, `/api/inventory`, and `POST /api/auth/login` / `/api/auth/register`.

---

## 13. Key Features Checklist

- ✅ Dynamic categories/subcategories, product attributes, and homepage sections (no hardcoded per-type components)
- ✅ Cart with stock-quantity enforcement, coupon codes, tax + shipping calculation
- ✅ Wishlist with move-to-cart
- ✅ Mock authentication (login/register/change password) with `authGuard` and `adminGuard`
- ✅ Multi-step checkout (billing/shipping address, delivery method, mock payment method, order confirmation)
- ✅ Order history + order detail with status timeline
- ✅ Global search with live suggestions (products + categories)
- ✅ Full admin CRUD for products, categories, banners, offers, blog posts, and homepage sections; order status updates; inventory stock adjustment; customer activation toggle
- ✅ Loading, empty, and error states throughout
- ✅ Fully responsive, mobile-first Tailwind layout
- ✅ Reusable component library (ProductCard, ProductGrid, Rating, Pagination, QuantitySelector, Breadcrumb, HeroBanner, PromoBanner, Toast, ConfirmDialog, AdminSidebar, AdminHeader, etc.)

---

## 14. What's Intentionally Out of Scope

Per the project brief, this deliverable does **not** include a real backend, real payment processing, or a database — those are meant to be added later using ASP.NET Core, per the migration path described above.
