# Depósito Dental Virtual Pitalito

Plataforma web **B2B** para compra autoservicio de insumos odontológicos, orientada a compras **rápidas, repetitivas y técnicas**.

---

## Tabla de contenido
- [Resumen](#resumen)
- [Problema y contexto](#problema-y-contexto)
- [Objetivos](#objetivos)
- [Alcance (MVP)](#alcance-mvp)
- [Funcionalidades](#funcionalidades)
  - [Cliente](#cliente)
  - [Administrador](#administrador)
- [Arquitectura (visión general)](#arquitectura-visión-general)
- [Requisitos no funcionales](#requisitos-no-funcionales)
- [Convenciones y calidad](#convenciones-y-calidad)
- [Roadmap](#roadmap)
- [Equipo](#equipo)

---

## Resumen
El depósito dental opera hoy con canales tradicionales (WhatsApp / asesor comercial / pedidos manuales). El proyecto construye una plataforma web que permita vender a nivel nacional de forma autoservicio, reduciendo la intervención humana y mejorando la eficiencia operativa.

**No es un ecommerce retail.** Es un B2B ligero: usuarios que conocen referencias, compran rápido y repiten pedidos. La experiencia prioriza **velocidad y funcionalidad**.

---

## Problema y contexto
- El proceso actual depende de atención humana para cotizar, confirmar disponibilidad, tomar pedidos y hacer seguimiento.
- Esto limita escalabilidad, aumenta tiempos de respuesta y dificulta digitalizar inventario/ventas.

La solución propuesta es una plataforma web con:
- catálogo público navegable y buscable
- compra autoservicio (carrito + checkout)
- gestión de pedidos e inventario
- diferenciación mediante chatbot semántico (fase 2+)

---

## Objetivos
**Objetivo principal**
- Digitalizar y escalar la operación comercial.

**Objetivos específicos**
- catálogo online navegable (categorías, búsqueda, filtros)
- compra autoservicio y seguimiento de pedidos
- administración de inventario y órdenes
- dashboard de ventas y KPIs (progresivo)
- chatbot semántico basado en catálogo (progresivo)
- arquitectura escalable y multi-cloud

---

## Alcance (MVP)
El MVP prioriza la base de catálogo + compra + admin, evitando sobreingeniería.

Incluye:
- catálogo público con detalle técnico e INVIMA visible
- autenticación con Google
- carrito y checkout (pagos inicialmente en modo sandbox o método simple)
- gestión básica de órdenes
- CRUD básico de productos e inventario

Fuera del MVP (fases posteriores):
- chatbot RAG completo y acciones sobre el carrito
- pagos reales + facturación electrónica
- dashboards avanzados
- extracción a microservicios

---

## Funcionalidades

### Cliente
- Ver catálogo público
- Navegar por categorías
- Buscar y filtrar productos
- Ver ficha técnica (imágenes, especificaciones, INVIMA)
- Autenticación OAuth Google
- Carrito (agregar/modificar cantidades)
- Finalizar compra y ver confirmación
- Historial y recompra (planeado)

### Administrador
- Gestión de productos (CRUD)
- Gestión de variantes y stock
- Gestión de órdenes (estados)
- Gestión de descuentos/combos (planeado)
- KPIs y dashboard (planeado)

---

## Arquitectura
Decisión principal para el MVP:
- **Monolito modular** en backend + integraciones desacopladas.

Motivo:
- Menos complejidad, menor costo, mayor velocidad de entrega.
- Permite dividir a futuro (por ejemplo, `shipping` y `chatbot`) cuando el crecimiento lo requiera.

Documentación de arquitectura (Sprint 0):
- Arquitectura del proyecto (alcance, NFR, dominio, componentes y diagramas UML): [wiki-drafts/Arquitectura-Sprint-0.md](wiki-drafts/Arquitectura-Sprint-0.md)

---

## Requisitos no funcionales
- Escalabilidad horizontal
- Multi-cloud (AWS, Azure, GCP)
- Rendimiento objetivo: p95 < 2s (lecturas comunes del catálogo)
- SEO-friendly (SSR en rutas públicas)
- Seguridad básica empresarial (OAuth, JWT, RBAC, HTTPS, rate limiting)
- Disponibilidad alta y backups automáticos

---

## Convenciones y calidad
Recomendaciones para mantener el proyecto escalable:
- Backend por módulos y capas (controllers / use-cases / domain / repositories / integrations)
- Validación de DTOs + sanitización
- Logging estructurado (con `requestId`)
- Paginación obligatoria en listados
- Políticas RBAC desde el inicio para endpoints admin

---

## Roadmap
- Fase 1: catálogo + login + carrito + órdenes + admin básico + pagos sandbox
- Fase 2: chatbot semántico + combos + descuentos + tracking inicial + dashboards
- Fase 3: pagos reales + facturación electrónica
- Fase 4: PWA + integraciones ERP/CRM + optimizaciones

---

## Equipo
- Leidy Carolina Obando Figueroa
- Diego Eduardo Chourio Garcia
- Juan Pablo Padilla Carvajal
- Tomás Posada Suarez
- Juan Sebastian Rave Martinez
