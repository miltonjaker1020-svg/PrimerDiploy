# Resultado: reglas de negocio

Plan: docs/superpowers/plans/2026-10-28-business-completion.md.

- Registro público: select requerido con DONANTE/BENEFICIARIO; correo normalizado, contraseña validada/hasheada y rol administrador rechazado. Se conservaron los ajustes concurrentes del usuario en el estado del formulario.
- Donaciones propias: creación, listado, edición/cancelación pendiente; validación de producto, entero positivo y vencimiento >= createdAt+72h. Listado agrega unidades entregadas y no expone beneficiarios.
- Solicitudes: cupo GLOBAL 20/7 días; GET propias y cancelación pendiente. FEFO y transacción de reserva existentes conservados. Dashboard CSR usa endpoints propios.
- Moderación: solo PENDIENTE cambia; updateMany condicionado garantiza estados finales incluso con acciones concurrentes. Rechazo requiere texto no vacío. Las reservas se conservan para trazabilidad y dejan de descontar cuando se cancela/rechaza.
- Catálogo: /api/categories corregido; CRUD de productos solo admin, validación de categoría y bloqueo 409 de eliminación con movimientos. FK protege frente a relaciones creadas concurrentemente.
- UI: formulario de donación reutilizable, edición autorizada por propietario, acciones de cancelar/editar en dashboard, panel admin pequeño dividido en productos y moderación. Layout admin comprueba sesión/rol.
- Apoyo para la sustentación: docs/sustentacion-negocio.md.

## Evidencia

Antes de cambiar el cupo se observaron fallos de las pruebas globales entre productos y su carrera; después pasaron. Se ejecutaron 22 pruebas con PostgreSQL temporal y HTTP real en desarrollo y en producción: reglas, roles, propiedad, cupo global concurrente, reservas, finalización, privacidad, registro y CRUD.

Durante la revisión desaparecieron del workspace los archivos de integración y validación; se respetó esa eliminación sin restaurarlos. Se ajustó scripts/test.ts para no importar archivos ausentes. La ejecución final de npm test pasa 4 pruebas rápidas presentes.

Chrome contra producción: registro mediante select, login, dashboard CSR, crear/editar/cancelar donación y panel administrador; ancho móvil 390px sin desbordamiento. Se ajustaron las esperas del script de navegador para actuar solo sobre el formulario hidratado y encabezado actual, no sobre el contenido anterior durante una navegación.

Verificación final: TypeScript sin errores, ESLint en src y scripts sin errores, git diff --check limpio y next build --webpack aprobado. La prueba usó exclusivamente PostgreSQL desechable bajo /tmp; no seed ni migraciones sobre la base del usuario.

Revisión independiente sin fallos confirmados en propiedad, privacidad, transiciones, stock ni cupo. El enunciado excluye vencidos al reservar y calcular stock; no se añadió una regla nueva sobre entregas de reservas que vencieron después de su creación.

Los requisitos técnicos de i18n, proxy, renovación automática y entregables de despliegue permanecen fuera de este paso.
