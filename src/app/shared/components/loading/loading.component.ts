import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './loading.component.html',
})
export class LoadingComponent {
  /** Number of skeleton cards to render when used in a grid context. */
  @Input() variant: 'spinner' | 'grid' = 'spinner';
  @Input() count = 8;

  get skeletons(): number[] {
    return Array.from({ length: this.count }, (_, i) => i);
  }
}
