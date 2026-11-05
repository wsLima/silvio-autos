import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login {
  protected readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected email = '';
  protected password = '';
  protected showPassword = false;
  protected submitted = false;

  protected isLoading = this.authService.isLoading;
  protected error = this.authService.error;

  protected hasError(field: 'email' | 'password'): boolean {
    if (!this.submitted) return false;
    return field === 'email' ? !this.email.trim() : !this.password.trim();
  }

  protected async onLogin(): Promise<void> {
    this.submitted = true;

    if (this.hasError('email') || this.hasError('password')) {
      const labels: string[] = [];
      if (this.hasError('email')) labels.push('Email');
      if (this.hasError('password')) labels.push('Senha');
      this.toast.show(`Preencha os campos obrigatórios: ${labels.join(', ')}`);
      return;
    }

    this.authService.clearError();
    try {
      await this.authService.login(this.email, this.password);
      this.router.navigate(['/admin/dashboard']);
    } catch {
      // Error is handled by the service
    }
  }

  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }
}
