import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Banner } from '../../../core/models';

@Component({
  selector: 'app-hero-banner',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './hero-banner.component.html',
})
export class HeroBannerComponent {
  @Input({ required: true }) banner!: Banner;
}
