import { Component, inject, computed } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { NavbarComponent } from './components/navbar/navbar.component';
import { FooterComponent } from './components/footer/footer.component';
import { OdontobotComponent } from './components/odontobot/odontobot.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    NavbarComponent,
    FooterComponent,
    OdontobotComponent
  ],
  template: `
    <!-- 🔝 NAVBAR SIEMPRE -->
    <app-navbar />

    <!-- CONTENIDO -->
    <main class="main-content">
      <router-outlet />
    </main>

    <!-- 🔻 SOLO SI NO ES ADMIN -->
    @if (!isAdmin()) {

      <app-footer />

      @if (!isCheckout()) {
        <app-odontobot />
      }

    }
  `,
  styles: [`
    .main-content {
      min-height: calc(100vh - 112px);
    }
  `]
})
export class AppComponent {

  /* 🔌 INYECCIONES */
  private auth = inject(AuthService);
  private router = inject(Router);

  /* 🧠 ESTADO */
  isAdmin = computed(() => this.auth.isAdmin());

  /* 🔎 CHECKOUT */
  isCheckout(): boolean {
    return this.router.url.startsWith('/checkout');
  }
}