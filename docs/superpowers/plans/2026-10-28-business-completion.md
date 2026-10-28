# Completar reglas de negocio de FoodShare

Usuario autoriza completar pendientes de las 21 reglas, con código sencillo de sustentar y select de rol.

Arquitectura: conservar Prisma y servicios existentes; route handlers cortos con validación/errores compartidos. Cambios de estado con updateMany condicionado a PENDIENTE para evitar carreras sin algoritmos adicionales. Mantener transacción Serializable existente solo para reserva de inventario.

- [x] Registro: email/password/rol DONANTE o BENEFICIARIO; select accesible, errores claros y rechazo de ADMINISTRADOR.
- [x] Donaciones: POST/GET propias y PATCH de edición/cancelación; producto válido, cantidad entera y vencimiento >= registro+3 días; solo PENDIENTE; formulario de alta/edición y unidades entregadas sin datos de beneficiarios.
- [x] Solicitudes: cupo global 20/7 días en backend/UI/pruebas; GET propias y PATCH cancelación; admin solo entrega/rechaza pendientes con motivo obligatorio; estados finales inmutables.
- [x] Productos/categorías: corregir /api/categories; CRUD admin de productos con validación y 409 al intentar borrar productos relacionados; interfaz simple para crear/editar/eliminar y moderación con errores.
- [x] Dashboard cliente con endpoints propios y acciones por rol; páginas servidor verifican acceso. Probar aislamiento, transiciones, devoluciones, cupo concurrente, registro y CRUD. Revisar tipos/lint/build y navegador en DB temporal.

Fuera de este paso: i18n, proxy, refresh automático, documentación Docker/README de entrega técnica completa. No migraciones ni seed sobre datos del usuario. Se trabaja en checkout actual con archivos previos sin seguimiento, sin commits.

Evidencia y límites: docs/superpowers/execution/2026-10-28-business-completion.md.
