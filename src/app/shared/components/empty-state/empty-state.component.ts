import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './empty-state.component.html',
})
export class EmptyStateComponent {
  @Input({ required: true }) title = '';
  @Input() description = '';
  @Input() icon: 'search' | 'cart' | 'heart' | 'box' | 'error' = 'box';
  @Input() actionLabel?: string;
  @Input() actionLink?: string[];
}
