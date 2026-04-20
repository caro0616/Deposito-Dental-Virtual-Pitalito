import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="admin-panel">

      <h1>Panel de Administración</h1>

      <nav class="admin-nav">
        <button (click)="section = 'news'" [class.active]="section === 'news'">
          Crear Noticia
        </button>

        <button (click)="section = 'stock'" [class.active]="section === 'stock'">
          Modificar Stock
        </button>

        <button (click)="section = 'orders'" [class.active]="section === 'orders'">
          Órdenes y Estados
        </button>
      </nav>

      <!-- 🔥 NEWS -->
      @if (section === 'news') {
        <section>
          <h2>Crear Noticia</h2>

          <form (submit)="$event.preventDefault(); createNews()">

            <input
              type="text"
              [(ngModel)]="newsTitle"
              name="title"
              placeholder="Título"
              required
            />

            <textarea
              [(ngModel)]="newsContent"
              name="content"
              placeholder="Contenido"
              required>
            </textarea>

            <button type="submit">Publicar</button>

          </form>

          @if (newsSuccess) {
            <div class="success">
              Noticia publicada correctamente.
            </div>
          }

        </section>
      }

      <!-- 🔥 STOCK -->
      @if (section === 'stock') {
        <section>
          <h2>Modificar Stock</h2>
          <p>[Gestión de stock de productos aquí]</p>
        </section>
      }

      <!-- 🔥 ORDERS -->
      @if (section === 'orders') {
        <section>
          <h2>Órdenes y Estados</h2>
          <p>[Gestión de órdenes y cambio de estado aquí]</p>
        </section>
      }

    </div>
  `,
  styles: [`
    .admin-panel {
      max-width: 700px;
      margin: 3rem auto;
      padding: 2rem;
      background: #fff;
      border-radius: 1rem;
      box-shadow: 0 2px 16px #0001;
      text-align: center;
    }

    .admin-nav {
      display: flex;
      justify-content: center;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .admin-nav button {
      padding: 0.5rem 1.5rem;
      border: none;
      border-radius: 2rem;
      background: #f0f0f0;
      cursor: pointer;
    }

    .admin-nav button.active,
    .admin-nav button:hover {
      background: #007bff;
      color: #fff;
    }

    form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1.5rem auto;
      max-width: 400px;
    }

    input, textarea {
      padding: 0.5rem;
      border-radius: 0.5rem;
      border: 1px solid #ccc;
    }

    .success {
      color: green;
      margin-top: 1rem;
    }
  `]
})
export class AdminPanelComponent {

  section: 'news' | 'stock' | 'orders' = 'news';

  newsTitle = '';
  newsContent = '';
  newsSuccess = false;

  createNews() {
    this.newsSuccess = true;

    setTimeout(() => {
      this.newsSuccess = false;
    }, 2000);

    this.newsTitle = '';
    this.newsContent = '';
  }
}