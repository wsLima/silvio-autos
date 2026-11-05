import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
  NgZone,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import {
  FavouriteIcon,
  Calendar03Icon,
  LocationIcon,
  EngineIcon,
  SearchIcon,
  FilterRemoveIcon,
} from '@hugeicons/core-free-icons';
import { Listing, ListingsService } from '../../core/services/listings.service';
import { WhatsappButton } from '../../shared/whatsapp-button/whatsapp-button';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'name';

@Component({
  selector: 'app-car-listing',
  standalone: true,
  imports: [CommonModule, HugeiconsIconComponent, WhatsappButton],
  templateUrl: './car-listing.html',
  styleUrl: './car-listing.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarListing {
  private readonly router = inject(Router);
  private readonly ngZone = inject(NgZone);
  private readonly listingsService = inject(ListingsService);

  // Hugeicons
  protected readonly calendarIcon = Calendar03Icon as any;
  protected readonly locationIcon = LocationIcon as any;
  protected readonly engineIcon = EngineIcon as any;
  protected readonly searchIcon = SearchIcon as any;
  protected readonly filterRemoveIcon = FilterRemoveIcon as any;

  protected readonly carListings = signal<Listing[]>([]);
  protected readonly isLoading = signal(true);
  protected readonly sortBy = signal<SortOption>('default');
  protected readonly selectedLocation = signal<string>('');
  protected readonly showLocationPrompt = signal<boolean>(false);

  // Advanced filters (input values)
  protected readonly filterModel = signal<string>('');
  protected readonly filterYearMin = signal<number>(2000);
  protected readonly filterYearMax = signal<number>(new Date().getFullYear());
  protected readonly filterPriceMin = signal<number>(0);
  protected readonly filterPriceMax = signal<number>(1000000);

  // Active filters (applied filters)
  protected readonly activeFilterModel = signal<string>('');
  protected readonly activeFilterYearMin = signal<number>(2000);
  protected readonly activeFilterYearMax = signal<number>(new Date().getFullYear());
  protected readonly activeFilterPriceMin = signal<number>(0);
  protected readonly activeFilterPriceMax = signal<number>(1000000);

  // Computed property to get unique locations
  protected readonly availableLocations = computed(() => {
    const locations = new Set(this.carListings().map((car) => car.locality));
    return Array.from(locations).sort();
  });

  // Computed property to filter listings by all criteria
  protected readonly filteredListings = computed(() => {
    const listings = this.carListings();
    const selectedLoc = this.selectedLocation();
    const model = this.activeFilterModel().toLowerCase();
    const yearMin = this.activeFilterYearMin();
    const yearMax = this.activeFilterYearMax();
    const priceMin = this.activeFilterPriceMin();
    const priceMax = this.activeFilterPriceMax();

    return listings.filter((car) => {
      // Location filter
      if (selectedLoc && car.locality !== selectedLoc) {
        return false;
      }

      // Model filter
      if (
        model &&
        !car.title.toLowerCase().includes(model) &&
        !car.model.toLowerCase().includes(model)
      ) {
        return false;
      }

      // Year filter
      if (car.year < yearMin || car.year > yearMax) {
        return false;
      }

      // Price filter
      const carPrice = Number(car.price);
      if (carPrice < priceMin || carPrice > priceMax) {
        return false;
      }

      return true;
    });
  });

  constructor() {
    this.requestGeolocation();
    this.loadListings();
  }

  private loadListings(): void {
    this.isLoading.set(true);
    this.listingsService.listPublic({ pageSize: 100 }).subscribe({
      next: (result) => {
        this.carListings.set(result.items);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false),
    });
  }

  private requestGeolocation(): void {
    // Run geolocation outside of Angular zone to avoid change detection
    this.ngZone.runOutsideAngular(() => {
      const geolocationApi = this.getGeolocationApi();
      if (geolocationApi) {
        geolocationApi.getCurrentPosition(
          () => {
            // User granted permission, show the prompt
            this.ngZone.run(() => {
              this.showLocationPrompt.set(true);
            });
          },
          () => {
            // User denied permission or error occurred - silently ignore
          },
        );
      }
    });
  }

  private getGeolocationApi(): any {
    if (typeof globalThis !== 'undefined' && 'navigator' in globalThis) {
      return (globalThis as any).navigator?.geolocation ?? null;
    }
    return null;
  }

  protected onApplyFilters(): void {
    // Copy input filter values to active filters
    this.activeFilterModel.set(this.filterModel());
    this.activeFilterYearMin.set(this.filterYearMin());
    this.activeFilterYearMax.set(this.filterYearMax());
    this.activeFilterPriceMin.set(this.filterPriceMin());
    this.activeFilterPriceMax.set(this.filterPriceMax());
  }

  protected onLocationSelect(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.selectedLocation.set(value);
    this.showLocationPrompt.set(false);
  }

  protected onDismissLocationPrompt(): void {
    this.selectedLocation.set('');
    this.showLocationPrompt.set(false);
  }

  protected onSortChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as SortOption;
    this.sortBy.set(value);

    const sorted = [...this.filteredListings()];

    switch (value) {
      case 'price-asc':
        sorted.sort((a, b) => Number(a.price) - Number(b.price));
        break;
      case 'price-desc':
        sorted.sort((a, b) => Number(b.price) - Number(a.price));
        break;
      case 'name':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;
      default:
        sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    this.carListings.set(sorted);
  }

  protected onFilterModelChange(event: Event): void {
    const value = (event.target as any).value;
    this.filterModel.set(value);
  }

  protected onFilterYearMinChange(event: Event): void {
    const value = (event.target as any).value;
    this.filterYearMin.set(value ? Number(value) : 2000);
  }

  protected onFilterYearMaxChange(event: Event): void {
    const value = (event.target as any).value;
    this.filterYearMax.set(value ? Number(value) : new Date().getFullYear());
  }

  protected onFilterPriceMinChange(event: Event): void {
    const value = (event.target as any).value;
    this.filterPriceMin.set(value ? Number(value) : 0);
  }

  protected onFilterPriceMaxChange(event: Event): void {
    const value = (event.target as any).value;
    this.filterPriceMax.set(value ? Number(value) : 1000000);
  }

  protected onResetFilters(): void {
    this.filterModel.set('');
    this.filterYearMin.set(2000);
    this.filterYearMax.set(new Date().getFullYear());
    this.filterPriceMin.set(0);
    this.filterPriceMax.set(1000000);
    this.selectedLocation.set('');

    // Also reset active filters
    this.activeFilterModel.set('');
    this.activeFilterYearMin.set(2000);
    this.activeFilterYearMax.set(new Date().getFullYear());
    this.activeFilterPriceMin.set(0);
    this.activeFilterPriceMax.set(1000000);
  }

  protected onViewDetails(carId: string): void {
    this.router.navigate(['/details', carId]);
  }
}
