import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-about',
  imports: [],
  templateUrl: './about.html',
  styleUrl: './about.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class About {
  @Input() aboutItems: any[] = [];
}
