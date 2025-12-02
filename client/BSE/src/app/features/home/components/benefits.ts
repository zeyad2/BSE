import { Component, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-benefits',
  imports: [],
  templateUrl: './benefits.html',
  styleUrl: './benefits.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Benefits {
  @Input() benefits: any[] = [];
  @Input() stats: any[] = [];
}
