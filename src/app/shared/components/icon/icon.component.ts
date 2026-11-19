import { Component, Input } from '@angular/core';
import { LucideAngularModule, Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, Heart, Info, LogOut, Menu, Minus, Package, Plus, Search, ShieldCheck, ShoppingCart, SquarePen, Trash2, TriangleAlert, UserRound, X } from 'lucide-angular';
const icons = { Check, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Copy, Heart, Info, LogOut, Menu, Minus, Package, Plus, Search, ShieldCheck, ShoppingCart, SquarePen, Trash2, TriangleAlert, UserRound, X };
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `<lucide-icon [img]="icons[name]" [size]="20" [strokeWidth]="2" class="block h-full w-full" />`,
  host: { 'aria-hidden': 'true', class: 'inline-block shrink-0' },
})
export class IconComponent {
  @Input({ required: true }) name!: keyof typeof icons;
  readonly icons = icons;
}
