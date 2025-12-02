import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pagination.component.html'
})
export class PaginationComponent {
  currentPage = input.required<number>();

  totalPages = input.required<number>();

  hasNext = input.required<boolean>();

  hasPrevious = input.required<boolean>();

  previous = output<void>();

  next = output<void>();
}
