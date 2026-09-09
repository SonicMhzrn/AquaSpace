import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';

@Component({
  selector: 'app-blog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, EmptyStateComponent],
  templateUrl: './blog.component.html',
})
export class BlogComponent {
  search = signal('');
  activeCategory = signal<string | null>(null);

  readonly filtered = computed(() => {
    const q = this.search().toLowerCase().trim();
    const cat = this.activeCategory();
    return this.blogSvc.publishedPosts().filter((p) => {
      const matchesQuery = !q || p.title.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
      const matchesCat = !cat || p.category === cat;
      return matchesQuery && matchesCat;
    });
  });

  readonly featured = computed(() => this.blogSvc.publishedPosts()[0]);
  readonly rest = computed(() => this.filtered().filter((p) => p.id !== this.featured()?.id));

  constructor(public blogSvc: BlogService, private seo: SeoService) {
    this.seo.update('Fish Care Blog', 'Guides and tips on aquarium setup, water quality, and fish care from AquaShop.');
  }
}
