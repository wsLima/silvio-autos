import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';

export interface User {
  id: string;
  email: string;
  name: string;
}

function extractErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    const message = (err.error as { message?: string | string[] } | null)?.message;
    if (Array.isArray(message)) return message.join(', ');
    if (message) return message;
    if (err.status === 401) return 'Email ou senha inválidos';
  }
  return fallback;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);

  readonly user = signal<User | null>(null);
  readonly isAuthenticated = signal(false);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);

  /** Resolves once the initial session check (GET /auth/me) has completed. */
  readonly ready: Promise<void>;

  constructor() {
    this.ready = this.restoreSession();
  }

  private async restoreSession(): Promise<void> {
    try {
      const user = await firstValueFrom(this.http.get<User>(`${API_BASE_URL}/auth/me`));
      this.user.set(user);
      this.isAuthenticated.set(!!user);
    } catch {
      this.user.set(null);
      this.isAuthenticated.set(false);
    }
  }

  async login(email: string, password: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);

    try {
      const user = await firstValueFrom(
        this.http.post<User>(`${API_BASE_URL}/auth/login`, { email, password }),
      );
      this.user.set(user);
      this.isAuthenticated.set(true);
    } catch (err) {
      this.error.set(extractErrorMessage(err, 'Erro ao fazer login'));
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.http.post(`${API_BASE_URL}/auth/logout`, {}));
    } finally {
      this.user.set(null);
      this.isAuthenticated.set(false);
    }
  }

  clearError(): void {
    this.error.set(null);
  }
}
