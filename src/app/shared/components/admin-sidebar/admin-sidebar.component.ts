import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  LucideAngularModule,
  LayoutDashboard,
  Package,
  Layers,
  ClipboardList,
  ShoppingBag,
  Users,
  Image,
  Tag,
  FileText,
  Star,
  Home,
  Settings
} from 'lucide-angular';

interface AdminNavItem {
  label: string;
  link: string;
  icon: any;
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    LucideAngularModule
  ],
  templateUrl: './admin-sidebar.component.html',
})
export class AdminSidebarComponent {

  @Input() mobileOpen = false;

  readonly navItems: AdminNavItem[] = [
    { label: 'Dashboard', link: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Products', link: '/admin/products', icon: Package },
    { label: 'Categories', link: '/admin/categories', icon: Layers },
    { label: 'Inventory', link: '/admin/inventory', icon: ClipboardList },
    { label: 'Orders', link: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', link: '/admin/customers', icon: Users },
    { label: 'Banners', link: '/admin/banners', icon: Image },
    { label: 'Offers', link: '/admin/offers', icon: Tag },
    { label: 'Blog', link: '/admin/blog', icon: FileText },
    { label: 'Reviews', link: '/admin/reviews', icon: Star },
    { label: 'Homepage', link: '/admin/homepage', icon: Home },
    { label: 'Settings', link: '/admin/settings', icon: Settings },
  ];
}