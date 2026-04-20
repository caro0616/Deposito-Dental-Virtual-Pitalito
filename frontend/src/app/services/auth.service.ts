import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { AuthResponse, UserPayload } from '../models/product.model';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private api = environment.apiUrl;

  private _user = signal<UserPayload | null>(null);
  private _token = signal<string | null>(null);

  readonly user     = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly userId   = computed(() => this._user()?.sub ?? null);
  readonly isAdmin  = computed(() => this._user()?.role === 'admin');

  constructor() {
    this.restoreSession();
  }

  // ── Registro ──────────────────────────────────────────
  async register(name: string, email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.api}/auth/register`, { name, email, password })
    );
    this.handleAuthResponse(res);
  }

  // ── Login local ───────────────────────────────────────
  async login(email: string, password: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.api}/auth/login`, { email, password })
    );
    this.handleAuthResponse(res);
  }

  // ── Login Google ──────────────────────────────────────
  async loginWithGoogle(credential: string): Promise<void> {
    const res = await firstValueFrom(
      this.http.post<AuthResponse>(`${this.api}/auth/google`, { credential })
    );
    this.handleAuthResponse(res);
  }

  // ── Verificar sesión actual ───────────────────────────
  async verifySession(): Promise<boolean> {
    try {
      const payload = await firstValueFrom(
        this.http.get<UserPayload>(`${this.api}/auth/me`)
      );
      this._user.set(payload);
      return true;
    } catch {
      this.clearSession();
      return false;
    }
  }

  // ── Logout ────────────────────────────────────────────
  logout(): void {
    this.clearSession();
    this.router.navigate(['/']);
  }

  // ── Token getter for interceptor ──────────────────────
  getToken(): string | null {
    return this._token();
  }

  // ── Private helpers ───────────────────────────────────
  private handleAuthResponse(res: AuthResponse): void {
    const payload = this.decodeToken(res.token);
    if (!payload) throw new Error('Token inválido');

    this._token.set(res.token);
    this._user.set(payload);

    localStorage.setItem('auth_token', res.token);
    localStorage.setItem('user_id', payload.sub);
  }

  private restoreSession(): void {
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    const payload = this.decodeToken(token);
    if (!payload) { this.clearSession(); return; }

    // Check expiration
    if (payload.exp && Date.now() / 1000 > payload.exp) {
      this.clearSession();
      return;
    }

    this._token.set(token);
    this._user.set(payload);
  }

  private clearSession(): void {
    this._token.set(null);
    this._user.set(null);
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
  }

  private decodeToken(token: string): UserPayload | null {
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]!.replace(/-/g, '+').replace(/_/g, '/')));
      return payload as UserPayload;
    } catch {
      return null;
    }
  }
}
