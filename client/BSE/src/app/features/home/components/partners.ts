import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';

@Component({
  selector: 'app-partners',
  imports: [CarouselModule],
  templateUrl: './partners.html',
  styleUrl: './partners.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Partners {
  @Input() PARTNERS: any[] = [];
  @Input() RESPONSIVE_OPTIONS: any[] = [];
}
