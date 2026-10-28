# Adaptar el catálogo público de FoodShare

**Autorización:** usuario eligió catálogo de alimentos público, solicitudes privadas, y autorizó proceder tras revisar cambios y alcance.
**Objetivo:** Home SSG sin presentación comercial, catálogo y detalle SSR, APIs públicas de productos y layout con navbar/footer; preservar el resto del trabajo.
**Enfoque:** compartir servicio de consultas Prisma entre SSR y route handlers propios, reutilizar inventario; no hacer fetch HTTP al propio servidor. DTO público con producto, categoría y stock, sin usuarios ni reservas. Rutas canónicas /products y /products/[id]. Sin migraciones: imagen local genérica con next/image, explícitamente ilustrativa.

- [x] Probar DTO público, stock aprobado/no vencido/reservas y producto inexistente con PostgreSQL desechable.
- [x] Crear servicio products y GET públicos /api/products y /api/products/[id]. Permitir buscar por nombre y mostrar solo disponibles, con entrada validada y errores consistentes.
- [x] Reemplazar portada genérica, resolver duplicación / y completar layout público. Home estática con accesos funcionales, sin consultas a base ni sesión.
- [x] Crear catálogo y detalle con consulta por petición y Suspense locales; estados vacíos, sin stock, error y notFound. Eliminar borradores públicos /requests que representan conceptos ajenos.
- [x] Conectar al formulario privado por productId preseleccionado, conservando autorización y validación existentes. No publicar detalles de solicitudes.
- [x] Verificar tipos, lint del alcance, pruebas anteriores, API real y navegador. Revisar cambios con agente independiente; conservar limitaciones ajenas al alcance.

**Fuera del alcance de este paso:** completar donaciones/admin, convertir dashboard CSR, corregir límite global, i18n integral, registro, proxy y renovación automática; pendientes ya comunicados para la prueba completa.
**Regla de trabajo:** mantener checkout actual porque src y prisma contienen trabajo previo sin seguimiento. No commits ni ejecución de seed contra la base del usuario.

Resultado y evidencia: `docs/superpowers/execution/2026-10-28-public-products.md`.
