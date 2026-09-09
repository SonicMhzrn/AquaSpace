import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html',
})
export class PaginationComponent {
  @Input({ required: true }) currentPage = 1;
  @Input({ required: true }) totalPages = 1;
  @Output() pageChange = new EventEmitter<number>();

  readonly pages = computed(() => {
    const total = this.totalPages;
    const current = this.currentPage;
    const window = 1;
    const result: (number | '...')[] = [];
    for (let p = 1; p <= total; p++) {
      if (p === 1 || p === total || (p >= current - window && p <= current + window)) {
        result.push(p);
      } else if (result[result.length - 1] !== '...') {
        result.push('...');
      }
    }
    return result;
  });

  go(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) return;
    this.pageChange.emit(page);
  }
}
