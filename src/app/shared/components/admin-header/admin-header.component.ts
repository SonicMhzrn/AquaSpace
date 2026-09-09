import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { InventoryService } from '../../../core/services/inventory.service';

@Component({
  selector: 'app-admin-header',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-header.component.html',
})
export class AdminHeaderComponent {
  @Output() menuToggle = new EventEmitter<void>();

  constructor(public authSvc: AuthService, public inventorySvc: InventoryService) {}

  logout(): void {
    this.authSvc.logout();
  }
}
