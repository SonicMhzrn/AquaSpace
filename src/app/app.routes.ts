import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  // ── Customer storefront ──
  { path: '', loadComponent: () => import('./features/home/home.component').then((m) => m.HomeComponent) },
  { path: 'products', loadComponent: () => import('./features/products/products.component').then((m) => m.ProductsComponent) },
  { path: 'category/:slug', loadComponent: () => import('./features/categories/category.component').then((m) => m.CategoryComponent) },
  { path: 'product/:id', loadComponent: () => import('./features/products/product-detail/product-detail.component').then((m) => m.ProductDetailComponent) },
  { path: 'cart', loadComponent: () => import('./features/cart/cart.component').then((m) => m.CartComponent) },
  { path: 'checkout', canActivate: [authGuard], loadComponent: () => import('./features/checkout/checkout.component').then((m) => m.CheckoutComponent) },
  { path: 'wishlist', loadComponent: () => import('./features/wishlist/wishlist.component').then((m) => m.WishlistComponent) },
  { path: 'login', loadComponent: () => import('./features/auth/login/login.component').then((m) => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./features/auth/register/register.component').then((m) => m.RegisterComponent) },
  { path: 'profile', canActivate: [authGuard], loadComponent: () => import('./features/profile/profile.component').then((m) => m.ProfileComponent) },
  { path: 'orders', canActivate: [authGuard], loadComponent: () => import('./features/orders/orders.component').then((m) => m.OrdersComponent) },
  { path: 'orders/:id', canActivate: [authGuard], loadComponent: () => import('./features/orders/order-detail/order-detail.component').then((m) => m.OrderDetailComponent) },
  { path: 'offers', loadComponent: () => import('./features/offers/offers.component').then((m) => m.OffersComponent) },
  { path: 'about', loadComponent: () => import('./features/about/about.component').then((m) => m.AboutComponent) },
  { path: 'contact', loadComponent: () => import('./features/contact/contact.component').then((m) => m.ContactComponent) },
  { path: 'blog', loadComponent: () => import('./features/blog/blog.component').then((m) => m.BlogComponent) },
  { path: 'blog/:slug', loadComponent: () => import('./features/blog/blog-detail/blog-detail.component').then((m) => m.BlogDetailComponent) },
  { path: 'fish-care', loadComponent: () => import('./features/fish-care/fish-care.component').then((m) => m.FishCareComponent) },

  // ── Admin panel ──
  {
    path: 'admin',
    canActivate: [adminGuard],
    loadComponent: () => import('./features/admin/layout/admin-layout.component').then((m) => m.AdminLayoutComponent),
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', loadComponent: () => import('./features/admin/dashboard/admin-dashboard.component').then((m) => m.AdminDashboardComponent) },
      { path: 'products', loadComponent: () => import('./features/admin/products/admin-products.component').then((m) => m.AdminProductsComponent) },
      { path: 'products/add', loadComponent: () => import('./features/admin/products/product-form/admin-product-form.component').then((m) => m.AdminProductFormComponent) },
      { path: 'products/edit/:id', loadComponent: () => import('./features/admin/products/product-form/admin-product-form.component').then((m) => m.AdminProductFormComponent) },
      { path: 'categories', loadComponent: () => import('./features/admin/categories/admin-categories.component').then((m) => m.AdminCategoriesComponent) },
      { path: 'orders', loadComponent: () => import('./features/admin/orders/admin-orders.component').then((m) => m.AdminOrdersComponent) },
      { path: 'inventory', loadComponent: () => import('./features/admin/inventory/admin-inventory.component').then((m) => m.AdminInventoryComponent) },
      { path: 'customers', loadComponent: () => import('./features/admin/customers/admin-customers.component').then((m) => m.AdminCustomersComponent) },
      { path: 'banners', loadComponent: () => import('./features/admin/banners/admin-banners.component').then((m) => m.AdminBannersComponent) },
      { path: 'offers', loadComponent: () => import('./features/admin/offers/admin-offers.component').then((m) => m.AdminOffersComponent) },
      { path: 'blog', loadComponent: () => import('./features/admin/blog/admin-blog.component').then((m) => m.AdminBlogComponent) },
      { path: 'reviews', loadComponent: () => import('./features/admin/reviews/admin-reviews.component').then((m) => m.AdminReviewsComponent) },
      { path: 'homepage', loadComponent: () => import('./features/admin/homepage/admin-homepage.component').then((m) => m.AdminHomepageComponent) },
      { path: 'settings', loadComponent: () => import('./features/admin/settings/admin-settings.component').then((m) => m.AdminSettingsComponent) },
    ],
  },

  { path: '**', loadComponent: () => import('./features/not-found/not-found.component').then((m) => m.NotFoundComponent) },
];
