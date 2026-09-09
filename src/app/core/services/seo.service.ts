import { Injectable } from '@angular/core';
import { Title, Meta } from '@angular/platform-browser';

/** Centralizes page title + meta description updates for SEO. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  constructor(private titleService: Title, private meta: Meta) {}

  update(title: string, description?: string): void {
    this.titleService.setTitle(`${title} | AquaShop`);
    if (description) {
      this.meta.updateTag({ name: 'description', content: description });
    }
  }
}
