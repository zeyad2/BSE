import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-banner',
  imports: [],
  templateUrl: './banner.html',
  styleUrl: './banner.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class About {
  @Input() aboutItems: any[] = [];
}
