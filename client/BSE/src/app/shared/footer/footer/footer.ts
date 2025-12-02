import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  private router = inject(Router);
  currentYear = new Date().getFullYear();

  scrollToSection(event: Event, sectionId: string) {
    event.preventDefault();

    // If not on home page, navigate to home first
    if (this.router.url !== '/') {
      this.router.navigate(['/']).then(() => {
        setTimeout(() => this.performScroll(sectionId), 100);
      });
    } else {
      this.performScroll(sectionId);
    }
  }

  private performScroll(sectionId: string) {
    const element = document.getElementById(sectionId);
    if (element) {
      const navbarHeight = 64;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navbarHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}
