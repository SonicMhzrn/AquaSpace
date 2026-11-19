import { Component } from '@angular/core';
@Component({
  selector: 'app-brand-mark',
  standalone: true,
  template: `<svg class="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 12c4-6 10-6 16 0-6 6-12 6-16 0Z"/><path d="m19 12 3-4v8l-3-4ZM8 19c3-1 6-1 9 0"/><circle cx="14" cy="11" r=".75" fill="currentColor" stroke="none"/></svg>`,
  host: { class: 'brand-mark' },
})
export class BrandMarkComponent {}
