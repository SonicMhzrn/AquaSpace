import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SettingsService } from '../../../core/services/settings.service';
import { CategoryService } from '../../../core/services/category.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './footer.component.html',
})
export class FooterComponent {
  newsletterEmail = '';
  readonly year = new Date().getFullYear();

  constructor(public settingsSvc: SettingsService, public categorySvc: CategoryService, private toast: ToastService) {}

  subscribe(): void {
    if (!this.newsletterEmail.trim()) return;
    this.toast.success('You\u2019re subscribed! Watch your inbox for aquarium tips.');
    this.newsletterEmail = '';
  }
}
