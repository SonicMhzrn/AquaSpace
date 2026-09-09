import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Banner } from '../../../core/models';

@Component({
  selector: 'app-promo-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './promo-banner.component.html',
})
export class PromoBannerComponent {
  @Input({ required: true }) banner!: Banner;
}
