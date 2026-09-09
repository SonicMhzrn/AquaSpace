import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-rating',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rating.component.html',
})
export class RatingComponent {
  @Input({ required: true }) value = 0;
  @Input() count?: number;
  @Input() size: 'sm' | 'md' = 'sm';

  readonly stars = computed(() => {
    const full = Math.floor(this.value);
    const hasHalf = this.value - full >= 0.5;
    return Array.from({ length: 5 }, (_, i) => (i < full ? 'full' : i === full && hasHalf ? 'half' : 'empty'));
  });
}
