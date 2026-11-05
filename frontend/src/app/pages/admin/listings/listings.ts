import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { PlusSignIcon, Edit02Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import { ListingsService, Listing } from '../../../core/services/listings.service';

@Component({
  selector: 'app-admin-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, HugeiconsIconComponent],
  templateUrl: './listings.html',
  styleUrl: './listings.scss',
})
export class AdminListingsComponent implements OnInit {
  private listingsService = inject(ListingsService);

  listings = this.listingsService.adminListings;

  // Hugeicons
  protected readonly plusIcon = PlusSignIcon as any;
  protected readonly editIcon = Edit02Icon as any;
  protected readonly trashIcon = Delete02Icon as any;

  ngOnInit(): void {
    this.listingsService.loadAdminListings();
  }

  onDelete(id: string): void {
    if (!confirm('Tem certeza que deseja deletar este anúncio?')) return;
    this.listingsService.deleteListing(id).subscribe(() => this.listingsService.loadAdminListings());
  }

  toggleStatus(listing: Listing): void {
    const newStatus = listing.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.listingsService
      .updateListing(listing.id, { status: newStatus })
      .subscribe(() => this.listingsService.loadAdminListings());
  }

  statusClass(status: string): string {
    return status.toLowerCase();
  }

  statusLabel(status: string): string {
    const labels: Record<string, string> = { ACTIVE: 'Ativo', INACTIVE: 'Inativo', SOLD: 'Vendido' };
    return labels[status] ?? status;
  }
}
