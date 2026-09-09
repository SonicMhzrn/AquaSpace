import { Component, OnInit, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CustomerService, CustomerSummary } from '../../../core/services/customer.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-customers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-customers.component.html',
})
export class AdminCustomersComponent implements OnInit {
  search = signal('');
  customers = signal<CustomerSummary[]>([]);
  selected = signal<CustomerSummary | null>(null);

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    return this.customers().filter((c) => !q || `${c.firstName} ${c.lastName}`.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  });

  constructor(private customerSvc: CustomerService, private toast: ToastService) {}

  ngOnInit(): void {
    this.customerSvc.getAllWithStats().subscribe((list) => this.customers.set(list));
  }

  view(c: CustomerSummary): void {
    this.selected.set(c);
  }

  closeView(): void {
    this.selected.set(null);
  }

  toggleStatus(c: CustomerSummary): void {
    this.customerSvc.toggleStatus(c.id);
    this.customerSvc.getAllWithStats().subscribe((list) => this.customers.set(list));
    this.toast.success(`${c.firstName} ${c.status === 'Active' ? 'deactivated' : 'activated'}`);
  }
}
