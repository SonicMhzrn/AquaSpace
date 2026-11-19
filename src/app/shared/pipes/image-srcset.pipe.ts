import { Pipe, PipeTransform } from '@angular/core';

const sources: Record<string, string> = {
  "assets/images/goldfish-480.webp": "assets/images/goldfish-480.webp 480w, assets/images/goldfish-800.webp 800w, assets/images/goldfish-1200.webp 1200w",
  "assets/images/goldfish-800.webp": "assets/images/goldfish-480.webp 480w, assets/images/goldfish-800.webp 800w, assets/images/goldfish-1200.webp 1200w",
  "assets/images/goldfish-1200.webp": "assets/images/goldfish-480.webp 480w, assets/images/goldfish-800.webp 800w, assets/images/goldfish-1200.webp 1200w",
  "assets/images/aquarium-480.webp": "assets/images/aquarium-480.webp 480w, assets/images/aquarium-800.webp 800w, assets/images/aquarium-1200.webp 1200w",
  "assets/images/aquarium-800.webp": "assets/images/aquarium-480.webp 480w, assets/images/aquarium-800.webp 800w, assets/images/aquarium-1200.webp 1200w",
  "assets/images/aquarium-1200.webp": "assets/images/aquarium-480.webp 480w, assets/images/aquarium-800.webp 800w, assets/images/aquarium-1200.webp 1200w",
  "assets/images/yellow-tang-480.webp": "assets/images/yellow-tang-480.webp 480w, assets/images/yellow-tang-800.webp 800w, assets/images/yellow-tang-1200.webp 1200w",
  "assets/images/yellow-tang-800.webp": "assets/images/yellow-tang-480.webp 480w, assets/images/yellow-tang-800.webp 800w, assets/images/yellow-tang-1200.webp 1200w",
  "assets/images/yellow-tang-1200.webp": "assets/images/yellow-tang-480.webp 480w, assets/images/yellow-tang-800.webp 800w, assets/images/yellow-tang-1200.webp 1200w",
  "assets/images/betta-480.webp": "assets/images/betta-480.webp 480w, assets/images/betta-800.webp 800w, assets/images/betta-1200.webp 1200w",
  "assets/images/betta-800.webp": "assets/images/betta-480.webp 480w, assets/images/betta-800.webp 800w, assets/images/betta-1200.webp 1200w",
  "assets/images/betta-1200.webp": "assets/images/betta-480.webp 480w, assets/images/betta-800.webp 800w, assets/images/betta-1200.webp 1200w",
  "assets/images/neon-tetra-480.webp": "assets/images/neon-tetra-480.webp 480w, assets/images/neon-tetra-800.webp 800w, assets/images/neon-tetra-1200.webp 1200w",
  "assets/images/neon-tetra-800.webp": "assets/images/neon-tetra-480.webp 480w, assets/images/neon-tetra-800.webp 800w, assets/images/neon-tetra-1200.webp 1200w",
  "assets/images/neon-tetra-1200.webp": "assets/images/neon-tetra-480.webp 480w, assets/images/neon-tetra-800.webp 800w, assets/images/neon-tetra-1200.webp 1200w"
};

@Pipe({ name: 'imageSrcset', standalone: true })
export class ImageSrcsetPipe implements PipeTransform {
  transform(source: string | undefined | null): string | null {
    return source ? sources[source] ?? null : null;
  }
}
