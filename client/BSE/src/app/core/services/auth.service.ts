import { computed, Injectable, signal } from '@angular/core';
import { AuthApiService } from './auth-api.service';
import { User } from '../models/user.model';
import { SignUpRequestDto } from '../models/auth/sign-up-request.dto';
import { AuthResponseDto } from '../models/auth/auth-response.dto';
import { SignInRequestDto } from '../models/auth/sign-in-request.dto';
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private authApi: AuthApiService) {
    this.loadUser();
  }

  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);
  private errorMessageSignal = signal<string | null>(null);

  currentUser = this.currentUserSignal.asReadonly();
  isLoading = this.isLoadingSignal.asReadonly();
  errorMessage = this.errorMessageSignal.asReadonly();

  isAuthenticated = computed(() => this.currentUserSignal() !== null);
  userRole = computed(() => this.currentUserSignal()?.role ?? 'User');

  private loadUser(): void {
    const token = localStorage.getItem('Token');
    if (token){
      console.log("token found", token)
    }
  }

  signUp(request: SignUpRequestDto) {
    this.isLoadingSignal.set(true);

    this.authApi.signUp(request).subscribe({
      next: (response: AuthResponseDto) => {
        const user: User = {
          email: response.email,
          fullName: response.fullName,
          role: response.role,
          token: response.token,
          expiresAt: new Date(response.expiresAt),
        };

        this.currentUserSignal.set(user);
        this.isLoadingSignal.set(false);
        localStorage.setItem('Token', user.token);
      },
      error: (error) => {
        const message = error.error?.message || 'Sign in failed. Please try again.';
        this.errorMessageSignal.set(message);
        this.isLoadingSignal.set(false);
      },
    });
  }

  signIn(request: SignInRequestDto) {
    this.isLoadingSignal.set(true);
    this.errorMessageSignal.set(null);

    this.authApi.signIn(request).subscribe({
      next: (response: AuthResponseDto) => {
        const user: User = {
          email: response.email,
          fullName: response.fullName,
          role: response.role,
          token: response.token,
          expiresAt: new Date(response.expiresAt),
        };

        this.currentUserSignal.set(user);
        this.isLoadingSignal.set(false);
        localStorage.setItem('Token', user.token);
      },
      error: (error) => {
        const message = error.error?.message || 'Sign in failed. Please try again.';
        this.errorMessageSignal.set(message);
        this.isLoadingSignal.set(false);
      },
    });
  }

  signOut(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('Token');
    this.errorMessageSignal.set(null);
  }
}
