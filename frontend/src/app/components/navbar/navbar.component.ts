import { odontobotOpenSignal } from '../../services/odontobot.service';
import { NotificationService } from '../../services/notification.service';
import { Component, signal, HostListener, inject, OnInit } from '@angular/core';
import { ApplicationRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { ProductService } from '../../services/product.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})

export class NavbarComponent implements OnInit {
  openOdontoBotFromNotif(id: string, event: Event) {
    event.preventDefault();
    this.notificationService.markAsRead(id);
    this.notificationsOpen.set(false);
    odontobotOpenSignal.set(true);
  }
  appRef = inject(ApplicationRef);
  notificationService = inject(NotificationService);
  cartService = inject(CartService);
  authService = inject(AuthService);
  productService = inject(ProductService);
  router = inject(Router);

  notifications = this.notificationService.notifications;
  notificationsOpen = signal(false);
  catalogOpen = signal(false);
  searchOpen = signal(false);
  scrolled = signal(false);
  isHomePage = signal(true);
  searchQuery = signal('');

  subNavLinks = [
    { label: 'Instrumental',   params: { cat: 'instrumental' } },
    { label: 'Materiales',     params: { cat: 'materiales' } },
    { label: 'Endodoncia',     params: { cat: 'consumibles' } },
    { label: 'Bioseguridad',   params: { cat: 'proteccion' } },
    { label: 'Equipos',        params: { cat: 'equipos' } },
  ];

  constructor() {
    this.router.events
      .pipe(filter((e): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        this.isHomePage.set(e.urlAfterRedirects === '/' || e.urlAfterRedirects === '');
        this.catalogOpen.set(false);
        this.searchOpen.set(false);
      });
  }


  async ngOnInit() {
    this.notificationService.fetchAll();
    if (this.authService.isLoggedIn()) {
      await this.cartService.loadCart();
    }
  }

  toggleNotifications() {
    const next = !this.notificationsOpen();
    this.notificationsOpen.set(next);
    if (next) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }

  @HostListener('document:click', ['$event'])
  onDocClick(e: MouseEvent) {
    if (!(e.target as HTMLElement).closest('.catalog-dropdown')) {
      this.catalogOpen.set(false);
    }
    // Cierra el modal de notificaciones si se hace click fuera de la campana o del modal
    if (
      this.notificationsOpen() &&
      !(e.target as HTMLElement).closest('.navbar__notif-modal-inner') &&
      !(e.target as HTMLElement).closest('.notif-btn')
    ) {
      this.toggleNotifications();
    }
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 10); }

  toggleCatalog(e: MouseEvent) { e.stopPropagation(); this.catalogOpen.update(v => !v); }
  toggleSearch()               { this.searchOpen.update(v => !v); }

  logout() {
    this.authService.logout();
    this.cartService.clearLocal();
  }

  onSearchSubmit() {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/catalogo'], { queryParams: { q } });
      this.searchOpen.set(false);
      this.searchQuery.set('');
    }
  }

  get userName(): string {
    const user = this.authService.user();
    return user?.email?.split('@')[0] ?? '';
  }
}
