import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-testimonials',
  imports: [CarouselModule],
  templateUrl: './testimonials.html',
  styleUrl: './testimonials.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Testimonials {
  @Input() testimonials: any[] = [];
  @Input() RESPONSIVE_OPTIONS: any[] = [];
}
