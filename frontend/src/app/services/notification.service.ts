import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface Notification {
  _id: string;
  title: string;
  message: string;
  url?: string;
  createdAt: string;
  read?: boolean;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  notifications = signal<Notification[]>([]);

  private http = inject(HttpClient);

  fetchAll() {
    this.http.get<Notification[]>('/api/notifications').subscribe(list => {
      // Si no hay notificaciones, agrega la de DentiBot por defecto
      if (!list.length || !list.some(n => n.title.includes('DentiBot'))) {
        list.unshift({
          _id: 'denti-bot',
          title: '¿Necesitas ayuda?',
          message: '¿Qué tal si hablas con DentiBot?',
          url: '/chatbot',
          createdAt: new Date().toISOString(),
        });
      }
      this.notifications.set(list.map(n => ({ ...n, read: false })));
    });
  }

  markAsRead(id: string) {
    this.notifications.update(list => list.map(n => n._id === id ? { ...n, read: true } : n));
  }

  remove(id: string) {
    this.notifications.update(list => list.filter(n => n._id !== id));
  }

  unreadCount() {
    return this.notifications().filter(n => !n.read).length;
  }
}
