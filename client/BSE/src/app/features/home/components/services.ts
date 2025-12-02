import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-services',
  imports: [CarouselModule, RouterLink],
  templateUrl: './services.html',
  styleUrl: './services.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Services {
  @Input() services: any[] = [];
}
