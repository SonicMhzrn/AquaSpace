import { Injectable, signal } from '@angular/core';
import { ENUM_ToastType } from '../enum/enum.shared';

export type ToastType = ENUM_ToastType;

export interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private nextId = 1;

  show(message: string, type: ToastType = ENUM_ToastType.Info, durationMs = 3200): void {
    const id = this.nextId++;
    this._toasts.update((list) => [...list, { id, message, type }]);
    setTimeout(() => this.dismiss(id), durationMs);
  }

  success(message: string): void {
    this.show(message, ENUM_ToastType.Success);
  }

  error(message: string): void {
    this.show(message, ENUM_ToastType.Error);
  }

  info(message: string): void {
    this.show(message, ENUM_ToastType.Info);
  }
  dismiss(id: number): void {
    this._toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
