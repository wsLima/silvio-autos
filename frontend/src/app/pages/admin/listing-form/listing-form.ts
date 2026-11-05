/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/explicit-member-accessibility */
import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HugeiconsIconComponent } from '@hugeicons/angular';
import { ArrowLeft01Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import {
  ListingsService,
  Listing,
  ListingImage,
  ListingStatus,
} from '../../../core/services/listings.service';
import { ToastService } from '../../../core/services/toast.service';

interface ListingFormModel {
  title: string;
  description: string;
  price: number;
  brand: string;
  model: string;
  year: number;
  manufacturingYear: number;
  locality: string;
  mileage: number;
  features: string;
  status: ListingStatus;
  isHighlight: boolean;
  contactName: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
}

const REQUIRED_TEXT_FIELDS: { key: keyof ListingFormModel; label: string }[] = [
  { key: 'title', label: 'Título' },
  { key: 'brand', label: 'Marca' },
  { key: 'model', label: 'Modelo' },
  { key: 'locality', label: 'Localidade' },
  { key: 'description', label: 'Descrição' },
  { key: 'contactName', label: 'Nome de contato' },
  { key: 'contactPhone', label: 'Telefone' },
  { key: 'contactWhatsapp', label: 'WhatsApp' },
  { key: 'contactEmail', label: 'Email de contato' },
];

function emptyForm(): ListingFormModel {
  const currentYear = new Date().getFullYear();
  return {
    title: '',
    description: '',
    price: 0,
    brand: '',
    model: '',
    year: currentYear,
    manufacturingYear: currentYear,
    locality: '',
    mileage: 0,
    features: '',
    status: 'ACTIVE',
    isHighlight: false,
    contactName: '',
    contactPhone: '',
    contactWhatsapp: '',
    contactEmail: '',
  };
}

@Component({
  selector: 'app-listing-form',
  standalone: true,
  imports: [CommonModule, FormsModule, HugeiconsIconComponent],
  templateUrl: './listing-form.html',
  styleUrl: './listing-form.scss',
})
export class ListingFormComponent implements OnInit {
  private listingsService = inject(ListingsService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toast = inject(ToastService);

  // Hugeicons
  protected readonly arrowLeftIcon = ArrowLeft01Icon as any;
  protected readonly trashIcon = Delete02Icon as any;

  isLoading = signal(false);
  isEditing = signal(false);
  error = signal<string | null>(null);
  existingImages = signal<ListingImage[]>([]);
  selectedFiles = signal<File[]>([]);

  form = signal<ListingFormModel>(emptyForm());
  submitted = false;

  getFieldErrors(): Set<string> {
    if (!this.submitted) return new Set();

    const value = this.form();
    const errors = new Set<string>();
    for (const field of REQUIRED_TEXT_FIELDS) {
      if (!String(value[field.key]).trim()) {
        errors.add(field.key);
      }
    }
    if (!value.price || value.price <= 0) {
      errors.add('price');
    }
    return errors;
  }

  brands = [
    'Toyota',
    'Honda',
    'Ford',
    'Chevrolet',
    'Volkswagen',
    'Fiat',
    'Hyundai',
    'Renault',
    'BMW',
    'Mercedes-Benz',
  ];

  currentYear = new Date().getFullYear();

  private listingId: string | null = null;
  private readonly currencyFormatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  ngOnInit(): void {
    this.listingId = this.route.snapshot.paramMap.get('id');
    if (!this.listingId) return;

    this.isEditing.set(true);
    this.listingsService.getAdminOne(this.listingId).subscribe({
      next: (listing) => this.applyListing(listing),
      error: () => this.error.set('Anúncio não encontrado'),
    });
  }

  private applyListing(listing: Listing): void {
    this.form.set({
      title: listing.title,
      description: listing.description,
      price: Number(listing.price),
      brand: listing.brand,
      model: listing.model,
      year: listing.year,
      manufacturingYear: listing.manufacturingYear,
      locality: listing.locality,
      mileage: listing.mileage,
      features: listing.features.join(', '),
      status: listing.status,
      isHighlight: listing.isHighlight,
      contactName: listing.contactName,
      contactPhone: listing.contactPhone,
      contactWhatsapp: listing.contactWhatsapp,
      contactEmail: listing.contactEmail,
    });
    this.existingImages.set(listing.images);
  }

  get currentForm(): ListingFormModel {
    return this.form();
  }

  set currentForm(value: ListingFormModel) {
    this.form.set(value);
  }

  formatPrice(value: number): string {
    return this.currencyFormatter.format(value || 0);
  }

  onPriceInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const digits = input.value.replace(/\D/g, '');
    const price = digits ? parseInt(digits, 10) / 100 : 0;
    this.form.update((f) => ({ ...f, price }));
    input.value = this.formatPrice(price);
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles.set(input.files ? Array.from(input.files) : []);
  }

  removeExistingImage(imageId: string): void {
    if (!this.listingId) return;
    if (!confirm('Remover esta imagem?')) return;

    this.listingsService.removeImage(this.listingId, imageId).subscribe((listing) => {
      this.existingImages.set(listing.images);
    });
  }

  onSubmit(): void {
    this.submitted = true;
    const errors = this.getFieldErrors();

    if (errors.size > 0) {
      const labels = REQUIRED_TEXT_FIELDS.filter((field) => errors.has(field.key)).map(
        (field) => field.label,
      );
      if (errors.has('price')) {
        labels.push('Preço');
      }
      this.toast.show(`Preencha os campos obrigatórios: ${labels.join(', ')}`);
      return;
    }

    const value = this.currentForm;
    this.isLoading.set(true);
    this.error.set(null);

    const features = value.features
      .split(',')
      .map((feature) => feature.trim())
      .filter(Boolean);

    const payload = { ...value, features };

    if (this.listingId) {
      this.listingsService.updateListing(this.listingId, payload).subscribe({
        next: () => this.uploadImagesThenExit(this.listingId!),
        error: (err) => this.onSaveError(err),
      });
    } else {
      this.listingsService.createListing(payload, this.selectedFiles()).subscribe({
        next: () => this.exit(),
        error: (err) => this.onSaveError(err),
      });
    }
  }

  private uploadImagesThenExit(id: string): void {
    const files = this.selectedFiles();
    if (files.length === 0) {
      this.exit();
      return;
    }

    this.listingsService.addImages(id, files).subscribe({
      next: () => this.exit(),
      error: (err) => this.onSaveError(err),
    });
  }

  private exit(): void {
    this.isLoading.set(false);
    this.router.navigate(['/admin/listings']);
  }

  private onSaveError(err: unknown): void {
    this.isLoading.set(false);
    if (err instanceof HttpErrorResponse) {
      const message = (err.error as { message?: string | string[] } | null)?.message;
      this.error.set(Array.isArray(message) ? message.join(', ') : message ?? 'Erro ao salvar anúncio');
    } else {
      this.error.set('Erro ao salvar anúncio');
    }
  }

  goBack(): void {
    this.router.navigate(['/admin/listings']);
  }
}
