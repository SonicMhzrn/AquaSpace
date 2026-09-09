import { Injectable, computed, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BlogPost } from '../models';
import { MOCK_BLOG_POSTS } from '../mock-data';
import { STORAGE_KEYS, StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class BlogService {
  private readonly _posts = signal<BlogPost[]>([]);
  readonly posts = this._posts.asReadonly();
  readonly publishedPosts = computed(() =>
    [...this._posts()].filter((p) => p.status === 'Published').sort((a, b) => +new Date(b.publishedDate) - +new Date(a.publishedDate))
  );

  constructor(private storage: StorageService) {
    this.storage.seed(STORAGE_KEYS.blogPosts, MOCK_BLOG_POSTS);
    this._posts.set(this.storage.get<BlogPost[]>(STORAGE_KEYS.blogPosts, MOCK_BLOG_POSTS));
  }

  private persist(): void {
    this.storage.set(STORAGE_KEYS.blogPosts, this._posts());
  }

  getAll(): Observable<BlogPost[]> {
    return of(this._posts()).pipe(delay(100));
  }

  getBySlug(slug: string): BlogPost | undefined {
    return this._posts().find((p) => p.slug === slug);
  }

  getRelated(post: BlogPost, limit = 3): BlogPost[] {
    return this.publishedPosts().filter((p) => p.id !== post.id && p.category === post.category).slice(0, limit);
  }

  getCategories(): string[] {
    return [...new Set(this.publishedPosts().map((p) => p.category))];
  }

  create(post: BlogPost): void {
    this._posts.update((list) => [post, ...list]);
    this.persist();
  }

  update(id: string, changes: Partial<BlogPost>): void {
    this._posts.update((list) => list.map((p) => (p.id === id ? { ...p, ...changes } : p)));
    this.persist();
  }

  delete(id: string): void {
    this._posts.update((list) => list.filter((p) => p.id !== id));
    this.persist();
  }

  togglePublish(id: string): void {
    this._posts.update((list) =>
      list.map((p) => (p.id === id ? { ...p, status: p.status === 'Published' ? 'Draft' : 'Published' } : p))
    );
    this.persist();
  }
}
