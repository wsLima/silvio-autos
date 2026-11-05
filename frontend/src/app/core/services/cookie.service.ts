import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

export interface CookieOptions {
  maxAge?: number; // segundos
  expires?: Date;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'Strict' | 'Lax' | 'None';
}

@Injectable({
  providedIn: 'root',
})
export class CookieService {
  private readonly document = inject(DOCUMENT);

  /**
   * Define um cookie com as opções fornecidas
   * @param name Nome do cookie
   * @param value Valor do cookie
   * @param options Opções do cookie
   */
  public setCookie(name: string, value: string, options?: CookieOptions): void {
    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (options) {
      // Max-Age (tempo de vida em segundos)
      if (options.maxAge !== undefined) {
        cookieString += `; Max-Age=${options.maxAge}`;
      }

      // Expires (data de expiração)
      if (options.expires) {
        cookieString += `; Expires=${options.expires.toUTCString()}`;
      }

      // Path
      if (options.path) {
        cookieString += `; Path=${options.path}`;
      } else {
        cookieString += '; Path=/';
      }

      // Domain
      if (options.domain) {
        cookieString += `; Domain=${options.domain}`;
      }

      // Secure
      if (options.secure) {
        cookieString += '; Secure';
      }

      // SameSite
      if (options.sameSite) {
        cookieString += `; SameSite=${options.sameSite}`;
      }
    } else {
      // Valores padrão
      cookieString += '; Path=/';
      // Cookie expira em 1 ano por padrão
      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      cookieString += `; Expires=${expiryDate.toUTCString()}`;
    }

    this.document.cookie = cookieString;
  }

  /**
   * Obtém o valor de um cookie
   * @param name Nome do cookie
   * @returns Valor do cookie ou null se não existir
   */
  public getCookie(name: string): string | null {
    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = this.document.cookie.split(';');

    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return decodeURIComponent(cookie.substring(nameEQ.length));
      }
    }

    return null;
  }

  /**
   * Remove um cookie
   * @param name Nome do cookie
   */
  public deleteCookie(name: string): void {
    this.setCookie(name, '', {
      maxAge: -1,
      path: '/',
    });
  }

  /**
   * Obtém todos os cookies como um objeto
   */
  public getAllCookies(): Record<string, string> {
    const cookies: Record<string, string> = {};
    const cookieArray = this.document.cookie.split(';');

    for (let cookie of cookieArray) {
      cookie = cookie.trim();
      const eqIndex = cookie.indexOf('=');
      if (eqIndex > -1) {
        const name = decodeURIComponent(cookie.substring(0, eqIndex));
        const value = decodeURIComponent(cookie.substring(eqIndex + 1));
        cookies[name] = value;
      }
    }

    return cookies;
  }

  /**
   * Verifica se um cookie existe
   */
  public hasCookie(name: string): boolean {
    return this.getCookie(name) !== null;
  }
}
