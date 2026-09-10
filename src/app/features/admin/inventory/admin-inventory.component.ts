import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { InventoryService } from '../../../core/services/inventory.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-inventory.component.html',
})
export class AdminInventoryComponent {
  search = signal('');
  statusFilter = signal<'all' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('all');
  editingId = signal<string | null>(null);
  draftQuantity = 0;
  draftMinimum = 0;

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const status = this.statusFilter();
    return this.inventorySvc.rows().filter((r) => {
      const matchesQuery = !q || r.product.name.toLowerCase().includes(q) || r.product.sku.toLowerCase().includes(q);
      const matchesStatus = status === 'all' || r.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  constructor(public inventorySvc: InventoryService, private toast: ToastService) {}

  startEdit(productId: string, currentQty: number, currentMin: number): void {
    this.editingId.set(productId);
    this.draftQuantity = currentQty;
    this.draftMinimum = currentMin;
  }

  save(productId: string, name: string): void {
    this.inventorySvc.adjustStock(productId, this.draftQuantity);
    this.inventorySvc.setMinimumStock(productId, this.draftMinimum);
    this.editingId.set(null);
    this.toast.success(`Updated stock for ${name}`);
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }
}
