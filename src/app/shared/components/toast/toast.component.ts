import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';
import { ENUM_ToastType } from '../../enum/enum.shared';

export type ToastPosition = 'top-center' | 'top-right' | 'bottom-right' | 'bottom-center';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toast.component.html',
})
export class ToastComponent {
  @Input() position: ToastPosition = 'top-center';
  ENUM_ToastType = ENUM_ToastType;

  constructor(public toastSvc: ToastService) {}
}
