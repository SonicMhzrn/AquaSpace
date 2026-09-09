import {
  Component,
  ElementRef,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  ViewChild,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';

export interface SlideImage {
  image: string;
  alt?: string;
  caption?: string;
}

/**
 * Generic, drop-in image slider/carousel.
 *
 * Fully self-contained: no dependency on any other component or service in
 * the app, so adding it cannot break anything that already exists. Feed it
 * an array of images and it handles autoplay, arrows, dot navigation, and
 * touch swipe on its own.
 *
 * Usage:
 *   <app-image-slider [slides]="mySlides" />
 */
@Component({
  selector: 'app-image-slider',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-slider.component.html',
})
export class ImageSliderComponent implements OnInit, OnChanges, OnDestroy {
  /** Images to display, in order. */
  @Input({ required: true }) slides: SlideImage[] = [];
  /** Aspect ratio applied to the slide viewport, e.g. '16/9', '21/9', '1/1'. */
  @Input() aspectRatio = '16/7';
  /** Auto-advance interval in ms. Set to 0 to disable autoplay. */
  @Input() autoplayMs = 5000;
  /** Rounds the slider's corners to match the app's card language. */
  @Input() rounded = true;

  @ViewChild('track') trackRef?: ElementRef<HTMLDivElement>;

  readonly activeIndex = signal(0);

  private timer?: ReturnType<typeof setInterval>;
  private touchStartX = 0;
  private touchDeltaX = 0;

  ngOnInit(): void {
    this.startAutoplay();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['slides']) {
      this.activeIndex.set(0);
    }
    if (changes['autoplayMs']) {
      this.startAutoplay();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (this.autoplayMs > 0 && this.slides.length > 1) {
      this.timer = setInterval(() => this.next(), this.autoplayMs);
    }
  }

  private stopAutoplay(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  goTo(index: number): void {
    if (!this.slides.length) return;
    this.activeIndex.set(((index % this.slides.length) + this.slides.length) % this.slides.length);
  }

  next(): void {
    this.goTo(this.activeIndex() + 1);
  }

  prev(): void {
    this.goTo(this.activeIndex() - 1);
  }

  /** Pause on hover/focus so users can read a caption or interact with an arrow. */
  onMouseEnter(): void {
    this.stopAutoplay();
  }

  onMouseLeave(): void {
    this.startAutoplay();
  }

  onTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0].clientX;
    this.touchDeltaX = 0;
    this.stopAutoplay();
  }

  onTouchMove(event: TouchEvent): void {
    this.touchDeltaX = event.touches[0].clientX - this.touchStartX;
  }

  onTouchEnd(): void {
    const threshold = 40;
    if (this.touchDeltaX > threshold) this.prev();
    else if (this.touchDeltaX < -threshold) this.next();
    this.startAutoplay();
  }
}
