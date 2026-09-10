import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { BlogService } from '../../core/services/blog.service';
import { SeoService } from '../../core/services/seo.service';

interface Guide {
  title: string;
  description: string;
  icon: string;
}

@Component({
  selector: 'app-fish-care',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './fish-care.component.html',
})
export class FishCareComponent {
  readonly guides: Guide[] = [
    { title: 'How to Set Up an Aquarium', description: 'Substrate, hardscape, equipment order, and your first fill.', icon: 'setup' },
    { title: 'Aquarium Cycling', description: 'Establish beneficial bacteria before adding fish, safely and patiently.', icon: 'cycle' },
    { title: 'How Often to Feed Fish', description: 'Portion sizes and schedules that prevent the most common beginner mistake.', icon: 'feed' },
    { title: 'Water Quality Maintenance', description: 'Weekly and monthly routines to keep parameters stable.', icon: 'water' },
    { title: 'Beginner Fish Guide', description: 'Hardy, forgiving species to start your first community tank.', icon: 'fish' },
    { title: 'Fish Compatibility', description: 'Which species thrive together, and combinations to avoid.', icon: 'compat' },
    { title: 'How to Clean an Aquarium', description: 'A gentle routine that removes waste without disrupting your cycle.', icon: 'clean' },
  ];

  readonly relatedPosts = computed(() => this.blogSvc.publishedPosts().slice(0, 6));

  constructor(public blogSvc: BlogService, private seo: SeoService) {
    this.seo.update('Fish Care Library', 'Educational guides on aquarium setup, cycling, feeding, and water quality.');
  }
}
