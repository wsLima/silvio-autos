/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { DashboardSquare03Icon, Car01Icon, Logout03Icon } from '@hugeicons/core-free-icons';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HugeiconsIconComponent],
  templateUrl: './admin-layout.html',
  styleUrl: './admin-layout.scss',
  host: {
    class: 'admin-wrapper',
    style: 'display: flex; overflow: hidden; width: 100%; height: 100%;',
  },
})
export class AdminLayoutComponent {
  private authService = inject(AuthService);
  private router = inject(Router);

  user = this.authService.user;
  isLoading = this.authService.isLoading;

  // Icons - using the correct icon types
  protected readonly dashboardIcon = DashboardSquare03Icon as any;
  protected readonly carIcon = Car01Icon as any;
  protected readonly logoutIcon = Logout03Icon as any;

  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}
