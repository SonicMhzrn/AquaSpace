import { Injectable, signal } from '@angular/core';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
}

interface PendingConfirm extends ConfirmRequest {
  resolve: (result: boolean) => void;
}

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  private readonly _pending = signal<PendingConfirm | null>(null);
  readonly pending = this._pending.asReadonly();

  confirm(request: ConfirmRequest): Promise<boolean> {
    return new Promise((resolve) => {
      this._pending.set({ ...request, resolve });
    });
  }

  resolve(result: boolean): void {
    this._pending()?.resolve(result);
    this._pending.set(null);
  }
}
