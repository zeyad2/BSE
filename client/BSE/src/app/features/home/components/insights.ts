import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-insights',
  imports: [RouterLink],
  templateUrl: './insights.html',
  styleUrl: './insights.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Insights {

}
