import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { ParticleBackgroundComponent } from './shared/components/particle-background/particle-background.component';
import { Footer } from './shared/footer/footer/footer';
import { Toast } from 'primeng/toast';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, ParticleBackgroundComponent, Footer, Toast],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {}
