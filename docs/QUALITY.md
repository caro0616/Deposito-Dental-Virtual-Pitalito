# Calidad del Software

Este documento resume cómo el proyecto **Depósito Dental Virtual Pitalito** aplica las prácticas de calidad descritas para la entrega.

## 1. Estándares de nombramiento

- **Lenguaje**: TypeScript en backend (NestJS) y frontend (Angular).
- **Convenciones usadas**:
  - Variables y funciones: `camelCase` (por ejemplo, `changeStatus`, `demoUserId`).
  - Clases y componentes: `PascalCase` (por ejemplo, `Cart`, `OrdersModule`, `CartComponent`).
  - Interfaces y DTOs: `PascalCase` con sufijo `Dto` donde aplica (por ejemplo, `UpdateOrderStatusDto`).
  - Constantes: `UPPER_SNAKE_CASE` cuando son globales.
  - Carpetas: `kebab-case` (por ejemplo, `modules/orders`, `admin-orders`).
  - Ramas: `feature/...` siguiendo GitHub Flow (por ejemplo, `feature/hu8-hu10-hu24-order-flow`).

Estas reglas siguen las recomendaciones de TypeScript y de la comunidad de frameworks modernos y se aplican en todo el código nuevo.

## 2. Análisis estático de código

Se utilizan **ESLint** y **Prettier** tanto en backend como en frontend.

### Backend (NestJS)

- Configuración en `backend/.eslintrc.cjs`.
- Scripts en `backend/package.json`:
  - `npm run lint`: ejecuta ESLint sobre `src/**/*.ts`.
  - `npm run format`: formatea con Prettier `src/**/*.ts`.
- Reglas clave:
  - `eslint:recommended` + `plugin:@typescript-eslint/recommended`.
  - Prohibido `any` (`@typescript-eslint/no-explicit-any`).
  - `eqeqeq` obligado.
  - Detección de variables no usadas.
  - Integración con Prettier (`plugin:prettier/recommended`).

### Frontend (Angular)

- Configuración en `frontend/.eslintrc.cjs`.
- Scripts en `frontend/package.json`:
  - `npm run lint`: ejecuta ESLint sobre `src/**/*.ts`.
  - `npm run format`: formatea con Prettier `src/**/*.{ts,tsx,html,scss}`.
- Reglas equivalentes a las del backend para mantener consistencia.

## 3. Estrategia de branching

Se utiliza **GitHub Flow**:

- Rama principal: `main`.
- Cada funcionalidad o grupo de HU se desarrolla en una rama `feature/...`.
  - Ejemplo: `feature/hu8-hu10-hu24-order-flow`.
- Todo cambio hacia `main` se realiza mediante Pull Request.
- El Pull Request debe pasar el pipeline de CI antes de poder fusionarse.

## 4. Integración continua (CI)

Se definió un pipeline en GitHub Actions en `.github/workflows/ci.yml`.

- Se ejecuta en:
  - `push` a `main` y `feature/**`.
  - `pull_request` hacia `main`.
- Jobs:
  - **backend** (carpeta `backend`):
    - `npm install`.
    - `npm run lint`.
    - `npm run build` (o verificación de que el proyecto compila).
  - **frontend** (carpeta `frontend`):
    - `npm install`.
    - `npm run lint`.
    - `npm run build`.

Este flujo asegura que el código que llega a `main` compila y cumple las reglas de estilo.

## 5. Seguridad y dependencias

- El repositorio utiliza las herramientas de seguridad provistas por GitHub (por ejemplo **Dependabot**) y los comandos de auditoría de npm (`npm audit`) para detectar vulnerabilidades en dependencias.
- Las actualizaciones de dependencias se revisan en Pull Requests, aprovechando el mismo pipeline de CI.

---

Con estas prácticas, el proyecto cumple los requisitos de calidad de software: estándares claros de nombramiento, análisis estático automatizado, estrategia de branching controlada y un pipeline de CI que refuerza la calidad en cada cambio.
