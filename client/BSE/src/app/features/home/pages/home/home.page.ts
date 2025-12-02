import { Component, AfterViewInit, OnDestroy, NgZone, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CarouselModule } from 'primeng/carousel';
import {
  HOME_SERVICES,
  HOME_BENEFITS,
  HOME_STATS,
  HOME_ABOUT_ITEMS,
  HOME_TESTIMONIALS,
  PARTNERS,
  RESPONSIVE_OPTIONS

} from '../../constants/home.constants';
import { ParticleBackgroundComponent } from "@/app/shared/components/particle-background/particle-background.component";
import { Hero } from "../../components/hero";
import { Services } from "../../components/services";
import { Partners } from "../../components/partners";
import { Benefits } from "../../components/benefits";
import { About } from "../../components/about";
import { Testimonials } from "../../components/testimonials";
import { Insights } from "../../components/insights";

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CarouselModule, ParticleBackgroundComponent, Hero, Services, Partners, Benefits, About, Testimonials, Insights],
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomePage implements AfterViewInit, OnDestroy {
  private observer!: IntersectionObserver;

  readonly services = HOME_SERVICES;
  readonly benefits = HOME_BENEFITS;
  readonly stats = HOME_STATS;
  readonly aboutItems = HOME_ABOUT_ITEMS;
  readonly testimonials = HOME_TESTIMONIALS;
  readonly PARTNERS = PARTNERS;
  readonly RESPONSIVE_OPTIONS = RESPONSIVE_OPTIONS;

  constructor(private ngZone: NgZone) {}

  ngAfterViewInit(): void {
    // Run IntersectionObserver outside Angular zone to prevent unnecessary change detection
    this.ngZone.runOutsideAngular(() => {
      // Set up Intersection Observer for scroll animations
      this.observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
            } else {
              entry.target.classList.remove('visible');
            }
          });
        },
        {
          threshold: 0.1,
          rootMargin: '50px' // Start animating slightly before element enters viewport
        }
      );

      // Observe all elements with animate-on-scroll class
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        this.observer.observe(el);
      });
    });
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

