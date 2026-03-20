import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  email = '';
  password = '';
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Email and password are required.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    this.authService.login({
      email: this.email,
      password: this.password
    }).subscribe({
      next: (response) => {
        localStorage.setItem('token', response.token);
        localStorage.setItem('userRole', String(response.role));
        localStorage.setItem('userId', String(response.userId));

        const role = String(response.role).toUpperCase();
        if (role === 'ADMIN' || role === 'AGENT') {
          this.router.navigateByUrl('/admin');
        } else {
          this.router.navigateByUrl('/student');
        }
      },
      error: (error) => {
        this.errorMessage = error?.error?.error || 'Login failed.';
        this.isSubmitting = false;
      }
    });
  }
}