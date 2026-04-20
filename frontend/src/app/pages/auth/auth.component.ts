function getErrorMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null) {
    const e = err as Record<string, unknown>;
    if (
      'error' in e &&
      typeof e['error'] === 'object' &&
      e['error'] !== null &&
      'message' in (e['error'] as Record<string, unknown>)
    ) {
      return ((e['error'] as Record<string, unknown>)['message'] as string);
    }
    if ('message' in e) {
      return (e['message'] as string);
    }
  }
  return 'Error desconocido';
}
import { Component, inject, signal, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { CartService } from '../../services/cart.service';
import { GoogleAuthService } from '../../services/google-auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss'
})
export class AuthComponent implements AfterViewInit {
  authService   = inject(AuthService);
  cartService   = inject(CartService);
  googleAuth    = inject(GoogleAuthService);
  router        = inject(Router);

  @ViewChild('googleBtnContainer') googleBtnRef!: ElementRef<HTMLDivElement>;

  mode         = signal<'login' | 'register'>('login');
  email        = signal('');
  password     = signal('');
  name         = signal('');
  showPassword = signal(false);
  error        = signal('');
  loading      = signal(false);
  googleError  = signal('');

  get isGoogleConfigured(): boolean {
    return this.googleAuth.isConfigured;
  }

  switchMode(m: 'login' | 'register') { this.mode.set(m); this.error.set(''); }
  togglePassword() { this.showPassword.update(v => !v); }

  async ngAfterViewInit() {
    // Solo renderizar el botón de Google si el Client ID está configurado y estamos en modo login
    if (this.isGoogleConfigured && this.mode() === 'login') {
      this.initGoogleButton();
    }
  }

  private async initGoogleButton() {
    if (!this.googleBtnRef?.nativeElement) return;
    try {
      const credential = await this.googleAuth.renderButton(this.googleBtnRef.nativeElement);
      await this.handleGoogleCredential(credential);
    } catch (err: unknown) {
      // El usuario cerró el popup o hubo un error
      if (getErrorMessage(err) !== 'Google Client ID no configurado. Ver environment.ts') {
        this.googleError.set(getErrorMessage(err) || 'Error con Google Sign-In');
      }
    }
  }

  private async handleGoogleCredential(credential: string) {
    this.loading.set(true);
    this.error.set('');
    try {
      await this.authService.loginWithGoogle(credential);
      await this.cartService.loadCart();
      this.router.navigate(['/']);
    } catch (err: unknown) {
      this.error.set(getErrorMessage(err) || 'Error al autenticar con Google.');
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Fallback: botón custom que usa One Tap (para cuando el botón
   * renderizado no funciona o el Client ID no está configurado).
   */
  async loginWithGoogleManual() {
    if (!this.isGoogleConfigured) {
      this.googleError.set(
        'Google Client ID no configurado. Configúralo en src/environments/environment.ts ' +
        'con un ID de console.cloud.google.com → APIs & Services → Credentials → OAuth 2.0 Client ID.'
      );
      return;
    }

    this.loading.set(true);
    this.googleError.set('');
    try {
      const credential = await this.googleAuth.promptOneTap();
      await this.handleGoogleCredential(credential);
    } catch (err: unknown) {
      this.googleError.set(getErrorMessage(err) || 'Error con Google Sign-In.');
    } finally {
      this.loading.set(false);
    }
  }

  async submit() {
    if (!this.email() || !this.password()) {
      this.error.set('Por favor completa todos los campos.');
      return;
    }
    if (this.mode() === 'register' && !this.name()) {
      this.error.set('Por favor ingresa tu nombre.');
      return;
    }

    this.loading.set(true);
    this.error.set('');

    try {
      if (this.mode() === 'login') {
        await this.authService.login(this.email(), this.password());
      } else {
        await this.authService.register(this.name(), this.email(), this.password());
      }
      await this.cartService.loadCart();
      this.router.navigate(['/']);
    } catch (err: unknown) {
      const msg = getErrorMessage(err) || 'Error al autenticar. Intenta nuevamente.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}
