import { Component, AfterViewInit, OnDestroy, ViewChild, ElementRef, NgZone, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-particle-background',
  standalone: true,
  templateUrl: './particle-background.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ParticleBackgroundComponent implements AfterViewInit, OnDestroy {
  @ViewChild('particleCanvas', { static: true })
  canvasRef!: ElementRef<HTMLCanvasElement>;

  private canvas!: HTMLCanvasElement;
  private ctx!: CanvasRenderingContext2D;
  private particles: Array<{x: number, y: number, vx: number, vy: number, radius: number}> = [];
  private animationId: number = 0;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Run particle animation outside Angular zone to prevent change detection on every frame
    this.ngZone.runOutsideAngular(() => {
      this.canvas = this.canvasRef.nativeElement;
      this.ctx = this.canvas.getContext('2d')!;
      this.resizeCanvas();
      this.createParticles();
      this.animate();

      // Resize on window resize
      window.addEventListener('resize', this.resizeCanvas.bind(this));

      // Resize when content changes height (e.g., route changes)
      const resizeObserver = new ResizeObserver(() => {
        this.resizeCanvas();
      });
      resizeObserver.observe(document.body);
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.animationId);
    window.removeEventListener('resize', this.resizeCanvas.bind(this));
  }

  private resizeCanvas(): void {
    const newWidth = window.innerWidth;
    const newHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight,
      window.innerHeight
    );

    // Only update if dimensions changed to avoid unnecessary redraws
    if (this.canvas.width !== newWidth || this.canvas.height !== newHeight) {
      this.canvas.width = newWidth;
      this.canvas.height = newHeight;
    }
  }

  private createParticles(): void {
    const particleCount = Math.min(
      100,
      Math.floor((window.innerWidth * window.innerHeight) / 8000)
    );

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1
      });
    }
  }

  private animate = (): void => {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((particle, i) => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;

      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(246, 160, 41, 0.4)'; // #F6A029
      this.ctx.fill();

      this.particles.slice(i + 1).forEach(other => {
        const dx = particle.x - other.x;
        const dy = particle.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(other.x, other.y);
          const opacity = 0.15 * (1 - distance / 120);
          this.ctx.strokeStyle = `rgba(251, 146, 60, ${opacity})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });

    this.animationId = requestAnimationFrame(this.animate);
  };
}
