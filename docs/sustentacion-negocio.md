# Cómo explicar las reglas de FoodShare

La estructura conserva cuatro partes fáciles de seguir: páginas y componentes para la interfaz, route handlers para HTTP, funciones de validación y Prisma para consultar la base.

## Registro y permisos

El formulario permite elegir DONANTE o BENEFICIARIO con un select. La API valida esa misma lista: cambiar el formulario o enviar ADMINISTRADOR manualmente no permite crear administradores. Las contraseñas se guardan con bcrypt. El administrador se crea con el seed.

Cada endpoint privado verifica la cookie y el rol. El identificador del donante o beneficiario siempre sale de la sesión, nunca del formulario. Los listados filtran por ese identificador. Si alguien cambia un id en la URL, no obtiene registros de otro usuario.

## Donaciones

Una donación tiene producto, cantidad entera positiva y vencimiento al menos 72 horas después del registro. Se crea PENDIENTE. El donante solo puede editar o cancelar mientras siga pendiente. El administrador puede aprobarla o rechazarla; para rechazar debe explicar el motivo.

El dashboard muestra cantidad donada, estado y unidades entregadas. Estas últimas son la suma de sus asignaciones a solicitudes ENTREGADA. No se envían nombres ni correos de beneficiarios al donante.

## Solicitudes e inventario

El cupo es de 20 unidades TOTALES por beneficiario en los últimos 7 días: por ejemplo, 12 de arroz y 8 de frijol completan el cupo. Solo cuentan solicitudes PENDIENTE y ENTREGADA.

El stock disponible suma donaciones APROBADAS y no vencidas, y resta las unidades de solicitudes pendientes y entregadas. No se cambia la cantidad original de la donación.

Para crear una solicitud, la transacción existente comprueba cupo y stock, toma primero las donaciones con vencimiento más cercano y guarda las cantidades en RequestDonation. Si algo falla, no se guarda una solicitud a medias. La transacción Serializable y sus reintentos evitan que dos envíos simultáneos usen las mismas unidades o superen el cupo.

Cancelar o rechazar conserva RequestDonation como historial, pero deja de descontar esas reservas del stock. Así vuelven a estar disponibles en las mismas donaciones. ENTREGADA sigue descontando sus asignaciones: el consumo queda definitivo.

## Estados finales

Las actualizaciones utilizan un filtro con id y estado PENDIENTE. Si el registro ya cambió, la API responde 409. Es una condición sencilla aplicada al guardar, que también evita dos cambios simultáneos incompatibles.

El beneficiario solo puede cancelar. El administrador solo puede entregar o rechazar una solicitud pendiente. Nadie puede reabrir estados finales desde estos endpoints.

## Productos y categorías

Catalog agrupa productos; Product representa cada alimento. El administrador crea categorías y crea, edita o elimina productos. Antes de eliminar se comprueba si hay donaciones o solicitudes asociadas; además, las claves foráneas impiden que una operación simultánea deje datos huérfanos.

## Archivos para mostrar durante la sustentación

- `src/lib/business-rules.ts`: validaciones de cantidad, fecha, campos y motivo.
- `src/lib/api.ts`: validación de sesión/rol, JSON y errores HTTP.
- `src/lib/requests.ts`: cupo global y reserva transaccional.
- `src/lib/inventory.ts`: disponibilidad y vencimiento.
- `src/app/api/donations/[id]/route.ts`: propiedad y edición/cancelación pendiente.
- `src/app/api/admin/requests/[id]/route.ts`: estados finales con escritura condicionada.
- `src/app/(private)/dashboard/dashboard-client.tsx`: carga CSR y acciones por rol.
- `src/lib/access-rules.test.ts` y `src/lib/translations.test.ts`: pruebas rápidas de rutas, destinos y traducciones.

Se ejecutaron pruebas completas contra PostgreSQL temporal y HTTP. Los archivos de integración fueron retirados del workspace durante la revisión; se respetó esa eliminación y `npm test` conserva las pruebas rápidas que siguen presentes. Nunca usar el seed destructivo ni pruebas de escritura sobre datos reales.

## Cierre técnico

El README contiene instalación local y Docker, configuración de Supabase, migraciones y seed protegido. El proxy verifica sesión y rol antes de las páginas privadas; los endpoints siguen validando por su cuenta. La renovación comprueba el refresh JWT y su hash, y solo escribe una cookie nueva: nunca devuelve tokens en JSON. El navegador reintenta una sola vez tras un 401; varias llamadas simultáneas comparten la renovación.

Para ES/EN se usa un diccionario y un contexto React. La preferencia se guarda en cookie, pero el primer render es estable en español para conservar Home SSG. Al hidratar se aplica el idioma guardado. El indicador de vencimiento también espera al montaje antes de consultar la fecha local: por eso no genera diferencias de hidratación.

Las comprobaciones de Docker, roles, renovación, idiomas y navegador se hicieron con PostgreSQL desechable; no se modificó la base de datos del usuario.
