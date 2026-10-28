# Ejecución del catálogo público

Plan: `docs/superpowers/plans/2026-10-28-public-products.md`.

## Cambios

- Home estática con accesos a catálogo, disponibles y cuenta; sin landing comercial ni consultas de sesión/base.
- Una sola ruta `/`: eliminado el scaffold duplicado de `src/app/page.tsx`.
- Rutas canónicas `/products` y `/products/[id]`. Eliminados los borradores públicos `/requests` que contenían subastas; no se publican solicitudes de beneficiarios.
- Layout público con navbar y footer compartidos; tarjetas reutilizables, imagen SVG local ilustrativa mediante next/image, carga/error/notFound y filtros por nombre/disponibilidad.
- GET `/api/products?search=&available=true` y `/api/products/[id]`, públicos, sin caché de stock; DTO sin datos personales. API y SSR comparten servicio Prisma sin llamadas HTTP al propio servidor.
- Inventario por lote: la lista utiliza una consulta para productos y otra para existencias; reutiliza las reglas de donaciones aprobadas/no vencidas y reservas activas. La función existente de stock por producto conserva su firma compatible.
- CTA lleva productId al formulario privado. El login preserva únicamente ese destino interno; después de autenticar hace navegación completa para no reutilizar un redirect prefetched sin sesión. Las páginas mantienen autorización propia.
- Metadatos FoodShare e idioma inicial español. Sin migraciones, dependencias nuevas ni cambios de datos del usuario.

## Verificación

- RED inicial: prueba de productos falló al no existir el servicio.
- GREEN: 13 pruebas aprobadas sin omisiones con PostgreSQL 16 temporal y servidor local. Incluyen regresiones privadas, DTO público, stock, búsqueda, agotados, inexistentes, errores 400/404 y render SSR real.
- `npx tsc --noEmit --incremental false`: aprobado.
- ESLint sobre archivos modificados: aprobado.
- `next build --webpack`: aprobado; Home estática y catálogo/detalle con contenido dinámico de servidor bajo Suspense (Cache Components).
- Chrome escritorio y ancho 390px: inicio, catálogo, imagen cargada, stock, detalle, login y producto preseleccionado; sin desbordamiento horizontal.
- Revisión independiente identificó N+1; corregido mediante consulta de inventario por lote.

Las suites de integración necesitan `TEST_DATABASE_URL` explícita y, para HTTP, `TEST_APP_URL` apuntando a Next con la misma base desechable. El runner `npm test` omite las integraciones cuando esas variables faltan. No ejecutar el seed destructivo sobre una base con datos reales.

## Pendientes de la prueba completa (fuera de este paso)

Límite global de 20 unidades, dashboard CSR, CRUD/donaciones/cancelaciones restantes, registro por rol, proxy, renovación automática, ES/EN, componente de hidratación, README/.env.example y Docker. Este paso completa el catálogo público; no declara completada toda la prueba de desempeño.
