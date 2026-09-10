import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeService } from '../../../core/services/home.service';
import { ToastService } from '../../../shared/services/toast.service';

@Component({
  selector: 'app-admin-homepage',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-homepage.component.html',
})
export class AdminHomepageComponent {
  readonly orderedSections = computed(() => [...this.homeSvc.sections()].sort((a, b) => a.displayOrder - b.displayOrder));

  constructor(public homeSvc: HomeService, private toast: ToastService) {}

  toggle(id: string): void {
    this.homeSvc.toggleEnabled(id);
  }

  moveUp(index: number): void {
    if (index === 0) return;
    const ids = this.orderedSections().map((s) => s.id);
    [ids[index - 1], ids[index]] = [ids[index], ids[index - 1]];
    this.homeSvc.reorder(ids);
  }

  moveDown(index: number): void {
    const ids = this.orderedSections().map((s) => s.id);
    if (index === ids.length - 1) return;
    [ids[index], ids[index + 1]] = [ids[index + 1], ids[index]];
    this.homeSvc.reorder(ids);
  }
}
