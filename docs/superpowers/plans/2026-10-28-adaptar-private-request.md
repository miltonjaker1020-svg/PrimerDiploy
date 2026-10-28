# Adaptación de las páginas privadas de FoodShare

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Permitir a un beneficiario crear una solicitud real y verla en su dashboard, respetando sesión, inventario y modelo Prisma.

**Architecture:** Propuesta: página de servidor para autorización y carga inicial; componente cliente para el formulario; Route Handler para crear solicitudes; servicio de dominio para validación y reserva transaccional. El dashboard consulta datos propios en servidor para evitar crear endpoints de listado que ninguna otra pantalla necesita todavía.

**Tech Stack:** Next.js 16.4.3, React 19.3.0, TypeScript estricto, Prisma 6.19.3, PostgreSQL y Tailwind existentes.

**Spec:** Alcance propuesto y diagnóstico incluidos en este documento; aprobado por el usuario para ejecución. Límite confirmado: 20 unidades por producto y beneficiario.

## Diagnóstico comprobado

- `src/app/(private)/request/create/page.tsx` está vacío.
- `dashboard/page.tsx` consulta `/api/requests` y `/api/donations`, que no existen. Los endpoints administrativos existentes exigen ADMINISTRADOR.
- El dashboard usa `title`, `currentPrice` y `auction`, campos ajenos al esquema. Invoca `setDonations.map` y contiene `{donation.}`. `npx tsc --noEmit --incremental false` falla actualmente con TS1003 en la línea 67; el parser puede ocultar otros errores.
- `(private)/layout.tsx` solo aporta estilos. El nombre del grupo no impone autenticación y no aparece en las URLs.
- `getSession()` ya lee y verifica la cookie mediante `await cookies()`.
- `Request` necesita `beneficiaryId`, `productId` y `quantity`; estado inicial PENDIENTE. `RequestDonation` representa las reservas de donaciones concretas.
- `getProductAvailableStock()` excluye donaciones no aprobadas o vencidas, y descuenta reservas de solicitudes distintas de CANCELADA y RECHAZADA.
- El seed documenta FEFO y un límite de 20 unidades en 7 días; faltan las reglas originales para confirmar detalles del límite. No hay suite ni script de pruebas configurados.
- `src/types/donations.ts` está vacío; `payloads.ts` contiene únicamente el contrato JWT.

## Enfoques considerados

1. **Página de servidor + formulario cliente + Route Handler (recomendado):** mantiene el estilo API existente y concentra reglas en un servicio reutilizable.
2. **Server Action + formulario:** reduce código HTTP, pero agrega un patrón de mutación nuevo al proyecto. Es válido si se prefiere estandarizar así más adelante.

## Restricciones y decisiones propuestas

- Mantener `/request/create` y `/dashboard`, sin migraciones ni dependencias nuevas inicialmente.
- Solo BENEFICIARIO crea solicitudes; el servidor obtiene `beneficiaryId` de la sesión y fuerza PENDIENTE. Nunca aceptar estos valores como autoridad desde el formulario.
- Validar autorización junto a cada consulta o mutación. Un control en el layout no protege por sí solo páginas, acciones ni APIs.
- Mostrar producto, categoría, unidad y disponibilidad; pedir únicamente producto y cantidad entera positiva.
- Reservar con FEFO: vencimiento ascendente y desempate estable por id, solo donaciones APROBADAS con `expirationDate > now`.
- No ejecutar el seed como verificación: elimina los datos existentes.
- Aplicar el límite confirmado de 20 unidades por producto y beneficiario. Se adopta una ventana móvil de 7 × 24 horas con frontera incluida; PENDIENTE y ENTREGADA consumen cupo; CANCELADA y RECHAZADA se excluyen, en concordancia con el seed.

## Review Focus

- Sesión ausente o vencida durante el envío: 401 sin crear registros.
- Rol incorrecto o identidad manipulada: 403 o identidad derivada del servidor.
- Cantidad inválida o producto inexistente: rechazo sin efectos parciales.
- Stock que cambia durante el envío: no sobreasignar entre solicitudes concurrentes.
- Vencimiento y límites temporales: probar fronteras con reloj controlado.

## Tarea 1: Contratos y acceso privado

**Archivos:** modificar `src/app/(private)/layout.tsx` y `src/lib/auth-helpers.ts` solo si se necesita un helper compartido; crear `src/types/requests.ts`.

**Interfaces:** `CreateRequestInput = { productId: string; quantity: number }`; `RequestProductOption = { id: string; name: string; catalogName: string; unit: string | null; availableStock: number }`. Los DTO de listado exponen producto, cantidad, estado, fecha ISO y motivo de rechazo, sin datos sensibles de User.

- [x] Definir contratos específicos; mantener JWT en `payloads.ts`.
- [x] Preparar navegación privada según rol y enlace de creación para beneficiarios.
- [x] Verificar acceso directo sin sesión y con cada rol; proteger también la carga de datos de cada página. Redirigir a `/login` si falta sesión y a `/dashboard` si el rol no puede crear solicitudes.

## Tarea 2: Creación y reserva de solicitudes

**Archivos:** crear `src/lib/requests.ts`, `src/app/api/requests/route.ts` y `src/lib/requests.test.ts`; reutilizar las reglas de `src/lib/inventory.ts` sin usar una consulta fuera de la transacción como garantía de stock.

**Interfaces:** `createBeneficiaryRequest(beneficiaryId: string, input: CreateRequestInput)` produce una solicitud persistida y sus reservas. `POST /api/requests` recibe exclusivamente producto y cantidad; responde 201 con el DTO creado o `{ error: string }` con 400, 401, 403, 404, 409 o 500 según la causa.

- [x] Elegir un ejecutor de pruebas compatible con TypeScript; probar reglas de dominio y concurrencia contra PostgreSQL de pruebas, nunca la base del usuario.
- [x] Cubrir JSON inválido, cantidades 0/negativas/fraccionarias/no numéricas, producto inexistente, sesión ausente y rol incorrecto.
- [x] Crear solicitud y reservas en una transacción Serializable con reintentos acotados para conflictos de serialización; recalcular stock y cupo dentro de cada intento. Si no alcanza stock, responder 409 y revertir todo.
- [x] Cubrir asignación FEFO entre dos lotes, exclusión de vencidos/no aprobados y liberación por CANCELADA/RECHAZADA.
- [x] Probar los estados y fronteras del límite confirmado; aplicar esa misma regla dentro de la transacción.
- [x] Probar dos creaciones concurrentes sobre el mismo stock y sobre el cupo del mismo beneficiario: no sobreasignar ni superar el límite.

## Tarea 3: Página y formulario

**Archivos:** implementar `src/app/(private)/request/create/page.tsx`; crear `src/app/(private)/request/create/request-form.tsx`.

**Interfaces:** `RequestForm({ products }: { products: RequestProductOption[] })`; consume `POST /api/requests`. La página carga productos y disponibilidad desde servidor después de autorizar al beneficiario.

- [x] Exportar una página de servidor con encabezado, explicación y enlace de regreso.
- [x] Implementar formulario cliente con etiquetas accesibles, producto, unidad, disponibilidad y cantidad; validar entero positivo sin reemplazar la validación del servidor.
- [x] Mostrar ausencia de productos/stock, error de envío y envío pendiente; desactivar el botón mientras se procesa.
- [x] Conservar valores si falla; tratar 401 como sesión vencida y 409 como disponibilidad/cupo actualizado que requiere revisión.
- [x] Al recibir 201 navegar a `/dashboard` y refrescar los datos. Verificar creación exitosa y error de red en navegador.

## Tarea 4: Dashboard coherente con Prisma

**Archivos:** modificar `src/app/(private)/dashboard/page.tsx`; completar `src/types/donations.ts` únicamente si se necesita un DTO de donación compartido.

**Interfaces:** página de servidor autenticada; BENEFICIARIO consulta solicitudes con `beneficiaryId = session.userId`; DONANTE consulta donaciones con `donorId = session.userId`; ADMINISTRADOR recibe acceso a `/admin`.

- [x] Eliminar campos de subastas y representar `product.name`, `quantity`, `status`, unidad y fechas; mostrar motivo de rechazo cuando exista.
- [x] Sustituir fetch a rutas inexistentes por consultas de servidor filtradas por propietario y selección explícita de campos.
- [x] Mostrar solicitudes al beneficiario y donaciones al donante, con estados vacíos y navegación adecuada.
- [x] No atribuir un beneficiario directo a Donation: si se necesitan destinatarios, obtenerlos mediante `requestDonations.request.beneficiary` y definir el alcance de privacidad antes de exponerlos.
- [x] Verificar que dos usuarios del mismo rol no ven registros ajenos y que una solicitud recién creada aparece al regresar.

## Verificación de cierre

Las casillas de verificaciones indican ejecución de las comprobaciones; los bloqueos globales se detallan en el resultado y la evidencia, no implican que el build global esté aprobado.

- [x] Ejecutar las pruebas de reglas y concurrencia de la tarea 2 con base de pruebas aislada.
- [x] Ejecutar `npx tsc --noEmit --incremental false`, `npm run lint` y `npm run build`; distinguir problemas preexistentes fuera del alcance, sin afirmar que todo pasa si persisten.
- [x] Recorrer login → dashboard → crear solicitud → dashboard en Chrome y móvil; comprobar API con cookie inválida, rol incorrecto y stock insuficiente. Estados de catálogo vacío revisados en código; sin prueba de navegador específica de ese estado.
- [x] Revisar el diff para confirmar que no cambió el esquema, no se ejecutó el seed y no se modificó trabajo previo ajeno al alcance.

## Resultado de ejecución

Implementación y evidencia: `docs/superpowers/execution/2026-10-28-private-progress.md` y `docs/superpowers/execution/2026-10-28-private-tests.md`. La validación global conserva los bloqueos ajenos al alcance detallados allí.
