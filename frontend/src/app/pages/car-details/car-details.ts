/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import {
  Component,
  ChangeDetectionStrategy,
  signal,
  OnInit,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import {
  ArrowLeft01Icon,
  Mail01Icon,
  CallIcon,
  LocationIcon,
  Tick01Icon,
  WhatsappIcon,
  Calendar03Icon,
  EngineIcon,
} from '@hugeicons/core-free-icons';
import { BreadcrumbComponent } from '../../shared/breadcrumb/breadcrumb';
import { WhatsappButton } from '../../shared/whatsapp-button/whatsapp-button';
import { Listing, ListingsService } from '../../core/services/listings.service';

@Component({
  selector: 'app-car-details',
  standalone: true,
  imports: [CommonModule, HugeiconsIconComponent, BreadcrumbComponent, WhatsappButton],
  templateUrl: './car-details.html',
  styleUrl: './car-details.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CarDetails implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly listingsService = inject(ListingsService);
  protected readonly car = signal<Listing | null>(null);
  protected readonly selectedImageIndex = signal<number>(0);

  // Hugeicons
  protected readonly arrowLeftIcon = ArrowLeft01Icon as any;
  protected readonly mailIcon = Mail01Icon as any;
  protected readonly callIcon = CallIcon as any;
  protected readonly locationIcon = LocationIcon as any;
  protected readonly tickIcon = Tick01Icon as any;
  protected readonly whatsappIcon = WhatsappIcon as any;
  protected readonly calendarIcon = Calendar03Icon as any;
  protected readonly kmIcon = EngineIcon as any;

  protected readonly selectedImage = computed(() => {
    const car = this.car();
    if (!car) return '';
    return car.images[this.selectedImageIndex()]?.url ?? '/silvioautos.png';
  });

  protected readonly breadcrumbItems = computed(() => {
    const car = this.car();
    return [
      { label: 'Home', route: '/' },
      { label: 'Comprar', route: '/' },
      { label: car?.locality || 'Detalhes' },
      { label: car?.title || 'Carro' },
    ];
  });

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    this.listingsService.getPublic(id).subscribe({
      next: (listing) => {
        this.car.set(listing);
        this.selectedImageIndex.set(0);
      },
      error: () => this.router.navigate(['/']),
    });
  }

  protected goBack(): void {
    this.router.navigate(['/']);
  }

  protected selectImage(index: number): void {
    this.selectedImageIndex.set(index);
  }

  protected digitsOnly(value: string): string {
    return value.replace(/\D/g, '');
  }
}
