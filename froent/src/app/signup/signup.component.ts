import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, RegisterPayload } from '../services/auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './signup.html',
  styleUrl: './signup.css',
})
export class SignupComponent {
  form: RegisterPayload = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'STUDENT'
  };
  isSubmitting = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    if (!this.form.firstName || !this.form.lastName || !this.form.email || !this.form.password) {
      this.errorMessage = 'Please fill all fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.register(this.form).subscribe({
      next: (response) => {
        this.successMessage = response.message || 'Registered successfully. You can now login.';
        this.isSubmitting = false;
        setTimeout(() => this.router.navigateByUrl('/login'), 700);
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'Registration failed.';
        this.isSubmitting = false;
      }
    });
  }
}