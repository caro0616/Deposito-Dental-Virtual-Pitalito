# Proyecto Depósito Dental Virtual Pitalito

## Estructura general del repositorio

- backend/  - API (NestJS, monolito modular)
- frontend/ - SPA + SSR (Angular) [pendiente]
- docs/     - Documentación técnica interna
- infra/    - Infraestructura, docker, despliegues

## Backend

Dentro de `backend/src` se organiza por capas y módulos de dominio:

- config/   - Configuración de entorno, base de datos, seguridad.
- common/   - Elementos transversales (guards, interceptors, pipes, filters).
- shared/   - Tipos, DTOs y utilidades compartidas.
- modules/  - Un módulo por bounded context (auth, users, catalog, inventory, orders, payments, shipping, admin).

Cada módulo en `modules/*` sigue la misma estructura:

- domain/         - Entidades de dominio y lógica pura.
- application/    - Casos de uso / servicios de aplicación.
- infrastructure/ - Repositorios, mapeos y adaptadores.
- presentation/   - Controllers HTTP y DTOs de entrada/salida.
