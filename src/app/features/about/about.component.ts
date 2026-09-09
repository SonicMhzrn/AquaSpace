import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SeoService } from '../../core/services/seo.service';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
})
export class AboutComponent {
  readonly values = [
    { title: 'Aquarium Expertise', description: 'Our team has decades of combined experience keeping freshwater, planted, and reef tanks.' },
    { title: 'Livestock Welfare First', description: 'Every fish is quarantined and health-checked, and we never overstock our suppliers.' },
    { title: 'Honest Guidance', description: 'We\u2019ll tell you when a fish is wrong for your tank, even if it costs us a sale.' },
    { title: 'Community Focused', description: 'From our Fish Care Library to responsive support, we want every aquarist to succeed.' },
  ];

  constructor(private seo: SeoService) {
    this.seo.update('About Us', 'Learn about AquaShop\u2019s story, mission, and commitment to aquarium keepers everywhere.');
  }
}
