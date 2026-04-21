# Depósito Dental Virtual Pitalito Huila

Repositorio del proyecto **Depósito Dental Virtual Pitalito**, una plataforma web B2B para la gestión y compra autoservicio de insumos odontológicos.

Este repositorio contiene el código fuente, configuración y documentación técnica del sistema.

---

## Estado del proyecto
 En desarrollo — MVP

---
### Instalación
## Arranque rápido (completo)
bash
# 1. Backend
cd dental-fixed
cp .env.example .env          # Configurar MONGODB_URI con tu cluster Atlas
npm install
npm run seed                  # ← Poblar DB con 30 productos dentales + 4 usuarios
npm run dev                   # → http://localhost:3000

# 2. Frontend
cd deposito-dental
npm install
ng serve                      # → http://localhost:4200
## Credenciales de prueba (post-seed) | Email | Contraseña | Rol | |-------|-----------|-----| | admin@dentalpitalito.com | Admin2024! | Admin | | doctor@clinicapitalito.com | Doctor2024! | Cliente | | laura.ortiz@gmail.com | Laura2024! | Cliente | | estudiante.odonto@ucc.edu.co | Estudiante2024! | Cliente | ## Configuración de Google Sign-In El login con Google requiere un **Google Client ID** de Google Cloud Console: 1. Ir a [console.cloud.google.com](https://console.cloud.google.com) 2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID** 3. Application type: **Web application** 4. Authorized JavaScript origins: http://localhost:4200 5. Copiar el Client ID (formato: xxxx.apps.googleusercontent.com) 6. Pegarlo en src/environments/environment.ts:
typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000',
  googleClientId: 'TU-CLIENT-ID.apps.googleusercontent.com',
};
Sin el Client ID configurado, el botón de Google muestra un mensaje indicando los pasos. El login local funciona siempre sin configuración extra. ## Endpoints consumidos | Servicio | Método | Endpoint | Descripción | |----------|--------|----------|-------------| | **Auth** | POST | /auth/register | Registro local | | | POST | /auth/login | Login local | | | POST | /auth/google | Login con Google | | | GET | /auth/me | Verificar sesión | | **Catálogo** | GET | /products | Listar (con filtros) | | | GET | /products/search?q= | Búsqueda texto | | | GET | /products/categories | Categorías con conteo | | | GET | /products/:id | Ficha de producto | | **Carrito** | GET | /cart | Ver carrito | | | POST | /cart/items | Agregar producto | | | PATCH | /cart/items/:itemId | Cambiar cantidad | | | DELETE | /cart/items/:itemId | Eliminar ítem | | **Órdenes** | POST | /orders/checkout | Crear orden | | | GET | /orders/my | Historial del usuario | | **Admin** | GET/POST/PUT/DELETE | /admin/products[/:id] | CRUD productos | | | GET | /admin/orders | Todas las órdenes | | | PATCH | /admin/orders/:id/status | Cambiar estado | ## Estructura
src/app/
├── components/
│   ├── navbar/          → nav + búsqueda + dropdown categorías
│   ├── footer/          → pie de página
│   ├── odontobot/       → chatbot flotante (UI base)
│   └── product-card/    → tarjeta reutilizable
├── interceptors/
│   └── auth.interceptor.ts  → JWT + x-user-id automáticos
├── models/
│   └── product.model.ts     → interfaces alineadas con backend
├── pages/
│   ├── home/            → hero + categorías + productos destacados
│   ├── catalog/         → filtros + grid + búsqueda
│   ├── product-detail/  → ficha + INVIMA + materiales + carrito
│   ├── cart/            → carrito + checkout + historial + favoritos
│   └── auth/            → login/registro + Google Sign-In
├── services/
│   ├── auth.service.ts        → login, registro, JWT, sesión
│   ├── google-auth.service.ts → Google Identity Services SDK
│   ├── product.service.ts     → catálogo, búsqueda, favoritos
│   ├── cart.service.ts        → CRUD carrito vía API
│   └── order.service.ts       → checkout + historial
└── environments/
    ├── environment.ts         → dev (localhost:3000)
    └── environment.prod.ts    → producción