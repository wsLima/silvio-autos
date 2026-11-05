import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom, Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export type ListingStatus = 'ACTIVE' | 'INACTIVE' | 'SOLD';

export interface ListingImage {
  id: string;
  url: string;
  key: string;
  order: number;
}

export interface Listing {
  id: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  manufacturingYear: number;
  locality: string;
  /** Serialized as string by Prisma's Decimal -> JSON conversion. */
  price: string;
  mileage: number;
  description: string;
  features: string[];
  status: ListingStatus;
  isHighlight: boolean;
  contactName: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
  images: ListingImage[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedListings {
  items: Listing[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface PublicListingQuery {
  search?: string;
  brand?: string;
  locality?: string;
  minPrice?: number;
  maxPrice?: number;
  page?: number;
  pageSize?: number;
}

export interface ListingFormValue {
  title: string;
  brand: string;
  model: string;
  year: number;
  manufacturingYear: number;
  locality: string;
  price: number;
  mileage: number;
  description: string;
  features: string[];
  status?: ListingStatus;
  isHighlight?: boolean;
  contactName: string;
  contactPhone: string;
  contactWhatsapp: string;
  contactEmail: string;
}

@Injectable({
  providedIn: 'root',
})
export class ListingsService {
  private readonly http = inject(HttpClient);

  /** Shared store for the admin area (dashboard + listings list). */
  readonly adminListings = signal<Listing[]>([]);
  readonly isLoading = signal(false);

  listPublic(query: PublicListingQuery = {}): Observable<PaginatedListings> {
    let params = new HttpParams();
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    }
    return this.http.get<PaginatedListings>(`${API_BASE_URL}/listings`, { params });
  }

  getPublic(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${API_BASE_URL}/listings/${id}`);
  }

  async loadAdminListings(): Promise<void> {
    this.isLoading.set(true);
    try {
      const listings = await firstValueFrom(
        this.http.get<Listing[]>(`${API_BASE_URL}/admin/listings`),
      );
      this.adminListings.set(listings);
    } finally {
      this.isLoading.set(false);
    }
  }

  getAdminOne(id: string): Observable<Listing> {
    return this.http.get<Listing>(`${API_BASE_URL}/admin/listings/${id}`);
  }

  createListing(dto: ListingFormValue, files: File[]): Observable<Listing> {
    return this.http.post<Listing>(`${API_BASE_URL}/listings`, this.toFormData(dto, files));
  }

  updateListing(id: string, dto: Partial<ListingFormValue>): Observable<Listing> {
    return this.http.patch<Listing>(`${API_BASE_URL}/listings/${id}`, dto);
  }

  deleteListing(id: string): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/listings/${id}`);
  }

  addImages(id: string, files: File[]): Observable<Listing> {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return this.http.post<Listing>(`${API_BASE_URL}/listings/${id}/images`, formData);
  }

  removeImage(id: string, imageId: string): Observable<Listing> {
    return this.http.delete<Listing>(`${API_BASE_URL}/listings/${id}/images/${imageId}`);
  }

  private toFormData(dto: ListingFormValue, files: File[]): FormData {
    const formData = new FormData();
    formData.append('title', dto.title);
    formData.append('brand', dto.brand);
    formData.append('model', dto.model);
    formData.append('year', String(dto.year));
    formData.append('manufacturingYear', String(dto.manufacturingYear));
    formData.append('locality', dto.locality);
    formData.append('price', String(dto.price));
    formData.append('mileage', String(dto.mileage));
    formData.append('description', dto.description);
    formData.append('features', JSON.stringify(dto.features));
    formData.append('contactName', dto.contactName);
    formData.append('contactPhone', dto.contactPhone);
    formData.append('contactWhatsapp', dto.contactWhatsapp);
    formData.append('contactEmail', dto.contactEmail);
    if (dto.status) formData.append('status', dto.status);
    if (dto.isHighlight !== undefined) formData.append('isHighlight', String(dto.isHighlight));
    files.forEach((file) => formData.append('images', file));
    return formData;
  }
}
