import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quantity-selector',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './quantity-selector.component.html',
})
export class QuantitySelectorComponent {
  @Input() value = 1;
  @Input() min = 1;
  @Input() max = 99;
  @Output() valueChange = new EventEmitter<number>();

  decrement(): void {
    this.set(this.value - 1);
  }

  increment(): void {
    this.set(this.value + 1);
  }

  onInput(raw: number): void {
    this.set(Number(raw) || this.min);
  }

  private set(next: number): void {
    const clamped = Math.min(this.max, Math.max(this.min, next));
    this.value = clamped;
    this.valueChange.emit(clamped);
  }
}
