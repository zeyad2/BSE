import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';
import { ToastService } from '@/app/core/services/toast.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './signin.page.html'
})
export class SignInPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);

  authService = inject(AuthService);

  signInForm!: FormGroup;

  ngOnInit(): void {
    this.signInForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    // Stop if form is invalid
    if (this.signInForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.signInForm.markAllAsTouched();
      return;
    }

    // Get form values (type-safe)
    const { email, password } = this.signInForm.value;

    // Call auth service
    this.authService.signIn({ email, password });

    setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.toastService.success('Welcome back!', 'Signed In');
        this.router.navigate(['/']);
      } else if (this.authService.errorMessage()) {
        this.toastService.error(this.authService.errorMessage()!, 'Sign In Failed');
      }
    }, 500);
  }
}
