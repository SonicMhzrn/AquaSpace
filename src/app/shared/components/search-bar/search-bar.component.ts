import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductSearchService } from '../../../core/services/product-search.service';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './search-bar.component.html',
})
export class SearchBarComponent {
  query = '';
  readonly isOpen = signal(false);

  constructor(public searchSvc: ProductSearchService, private router: Router) {}

  onInput(): void {
    this.searchSvc.setQuery(this.query);
    this.isOpen.set(this.query.trim().length > 0);
  }

  onFocus(): void {
    if (this.query.trim()) this.isOpen.set(true);
  }

  close(): void {
    setTimeout(() => this.isOpen.set(false), 150);
  }

  submit(): void {
    if (!this.query.trim()) return;
    this.isOpen.set(false);
    this.router.navigate(['/products'], { queryParams: { q: this.query.trim() } });
  }

  selectSuggestion(): void {
    this.isOpen.set(false);
    this.query = '';
  }
}
