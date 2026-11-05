/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Component, inject, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ListingsService } from '../../../core/services/listings.service';
import {
  ChartColumnIcon,
  ChartUpIcon,
  CheckmarkCircle02Icon,
  CheckmarkCircle01Icon,
  Coins01Icon,
  PauseIcon,
  Calendar03Icon,
} from '@hugeicons/core-free-icons';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HugeiconsIconComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 'dashboard-page',
  },
})
export class AdminDashboardComponent implements OnInit {
  private listingsService = inject(ListingsService);

  listings = this.listingsService.adminListings;

  // Current date
  protected readonly currentDate = new Date();

  // Hugeicons
  protected readonly chartIcon = ChartColumnIcon as any;
  protected readonly activeIcon = CheckmarkCircle01Icon as any;
  protected readonly pauseIcon = PauseIcon as any;
  protected readonly checkIcon = CheckmarkCircle02Icon as any;
  protected readonly coinIcon = Coins01Icon as any;
  protected readonly trendingIcon = ChartUpIcon as any;
  protected readonly calendarIcon = Calendar03Icon as any;

  ngOnInit(): void {
    this.listingsService.loadAdminListings();
  }

  totalListings = computed(() => this.listings().length);

  activeListings = computed(
    () => this.listings().filter((item) => item.status === 'ACTIVE').length,
  );

  inactiveListings = computed(
    () => this.listings().filter((item) => item.status === 'INACTIVE').length,
  );

  soldListings = computed(() => this.listings().filter((item) => item.status === 'SOLD').length);

  totalValue = computed(() => this.listings().reduce((sum, item) => sum + Number(item.price), 0));

  averagePrice = computed(() => {
    const total = this.totalListings();
    return total > 0 ? Math.round(this.totalValue() / total) : 0;
  });

  recentListings = computed(() =>
    [...this.listings()]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5),
  );

  mostExpensive = computed(() => {
    const listings = this.listings();
    return listings.length > 0
      ? listings.reduce((prev, current) => (Number(prev.price) > Number(current.price) ? prev : current))
      : null;
  });

  statusClass(status: string): string {
    return status.toLowerCase();
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      ACTIVE: 'Ativo',
      INACTIVE: 'Inativo',
      SOLD: 'Vendido',
    };
    return labels[status] || status;
  }

  getDaysAgo(date: string | Date): number {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  }
}
