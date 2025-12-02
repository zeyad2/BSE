import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '@/app/core/services/auth.service';
import { ToastService } from '@/app/core/services/toast.service';
import { LoadingSpinnerComponent } from '@/app/shared/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, LoadingSpinnerComponent],
  templateUrl: './signup.page.html'
})
export class SignUpPage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private toastService = inject(ToastService);
  authService = inject(AuthService);
  signUpForm!: FormGroup;

  ngOnInit(): void {
    this.signUpForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      role: ['User', [Validators.required]]
    }, {
      // Form-level validator for password matching
      validators: this.passwordMatchValidator
    });
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password !== confirmPassword) {
      return { passwordMismatch: true };
    }

    return null;
  }

  onSubmit(): void {
    if (this.signUpForm.invalid) {
      this.signUpForm.markAllAsTouched();
      return;
    }

    const { fullName, email, password, role } = this.signUpForm.value;

    this.authService.signUp({ fullName, email, password, role });

    setTimeout(() => {
      if (this.authService.isAuthenticated()) {
        this.toastService.success('Account created successfully!', 'Welcome');
        this.router.navigate(['/']);
      } else if (this.authService.errorMessage()) {
        this.toastService.error(this.authService.errorMessage()!, 'Sign Up Failed');
      }
    }, 500);
  }
}
