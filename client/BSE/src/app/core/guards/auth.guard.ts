import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if user is authenticated (checks if currentUser signal has a value)
  if (authService.isAuthenticated()) {
    return true; // Allow navigation
  }

  return router.createUrlTree(['/'], {
    queryParams: { returnUrl: state.url }
  });
};

export const publicOnlyGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Allow access if NOT authenticated
  if (!authService.isAuthenticated()) {
    return true;
  }

  // Already logged in - redirect to home
  return router.createUrlTree(['/']);
};


export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Check if authenticated AND has admin role
  if (authService.isAuthenticated() && authService.userRole() === 'Admin') {
    return true;
  }

  // Not authorized - redirect to home
  return router.createUrlTree(['/']);
};
