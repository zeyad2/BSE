import { Component, ChangeDetectionStrategy, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-hero',
  imports: [CommonModule],
  templateUrl: './hero.html',
  styleUrl: './hero.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class Hero implements OnInit, OnDestroy {
  readonly words = ['Business', 'Operations', 'Workflow', 'Enterprise', 'Future'];
  currentWordIndex = signal(0);
  private intervalId?: number;

  ngOnInit(): void {
    setTimeout(() => {
      this.startWordCycle();
    }, 1000);
  }

  private startWordCycle(): void {
    this.intervalId = window.setInterval(() => {
      this.currentWordIndex.update(index => (index + 1) % this.words.length);
    }, 3100);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}
