import { Component, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CookieService } from '../../core/services/cookie.service';

@Component({
  selector: 'app-cookie-notice',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cookie-notice.html',
  styleUrl: './cookie-notice.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CookieNotice {
  private readonly cookieService = inject(CookieService);
  protected readonly showCookieNotice = signal<boolean>(this.getCookieConsent());

  protected onAcceptCookies(): void {
    // Define cookie com consentimento aceito e expira em 1 ano
    this.cookieService.setCookie('cookieConsent', 'accepted', {
      maxAge: 365 * 24 * 60 * 60, // 1 ano em segundos
      path: '/',
    });

    // Pode adicionar outros cookies aqui se necessário
    this.cookieService.setCookie('consentDate', new Date().toISOString(), {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });

    this.showCookieNotice.set(false);
  }

  protected onRejectCookies(): void {
    // Define cookie com consentimento rejeitado
    this.cookieService.setCookie('cookieConsent', 'rejected', {
      maxAge: 365 * 24 * 60 * 60, // 1 ano em segundos
      path: '/',
    });

    this.cookieService.setCookie('consentDate', new Date().toISOString(), {
      maxAge: 365 * 24 * 60 * 60,
      path: '/',
    });

    this.showCookieNotice.set(false);
  }

  private getCookieConsent(): boolean {
    const consent = this.cookieService.getCookie('cookieConsent');
    return !consent; // Show if no consent decision has been made
  }
}
