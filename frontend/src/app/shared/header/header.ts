import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { UserCircleIcon, LogoutIcon } from '@hugeicons/core-free-icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, HugeiconsIconComponent],
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class Header {
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  // Hugeicons
  protected readonly UserCircleIcon = UserCircleIcon as any;
  protected readonly LogoutIcon = LogoutIcon as any;

  // Auth signals
  protected readonly user = this.authService.user;
  protected readonly isAuthenticated = this.authService.isAuthenticated;

  protected navigateToLogin(): void {
    this.router.navigate(['/login']);
  }

  protected onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
