# Ejecución: docs/superpowers/plans/2026-10-28-adaptar-private-request.md

Autorización: ejecutar el plan; límite confirmado de 20 por producto.
Ruling: trabajar en el checkout actual sin commits — src y prisma son trabajo previo sin seguimiento; un worktree de HEAD no contiene el proyecto que el usuario quiere adaptar.
Ruling: ventana móvil de 7 × 24 horas, frontera inferior incluida; PENDIENTE y ENTREGADA consumen cupo, CANCELADA y RECHAZADA no. Es la interpretación consistente con seed e inventario; comunicada antes de implementar.
Pre-flight: tarea 1 define CreateRequestInput y RequestProductOption consumidos por tareas 2/3; tarea 2 devuelve DTO serializable consumido por formulario; tarea 4 consulta Prisma directamente. Sin incompatibilidades.
Baseline: dashboard tiene error TS1003 preexistente; no hay script de pruebas.

Tarea 1: completa — contratos de entrada/DTO/productos, navegación por rol y autorización en páginas/API.
Tarea 2: completa — creación y reserva FEFO en transacción Serializable, cupo por producto/beneficiario con reloj por intento y reintentos acotados P2034.
Tarea 3: completa — formulario cliente accesible, stock/cupo, errores, sesión vencida, conflicto con refresco y prevención de doble clic; página de servidor con autorización y carga inicial.
Tarea 4: completa — dashboard servidor filtrado por propietario y rol; campos reales de Prisma, estados vacíos y motivo de rechazo. Sin exposición de destinatarios ni endpoint GET innecesario.
Ruling: añadir loading.tsx, error.tsx y Suspense dentro de cada página y para la navegación — Cache Components/instant navigation en Next 16.4.3 necesitan fronteras para datos de sesión y consultas. Un loading heredado no elimina todos los avisos de navegación de esta versión.
Revisión independiente: sin bugs bloqueantes confirmados. Observaciones de cobertura atendidas: suite HTTP persistente; carreras con barrera después de ambas lecturas y aserción de reintento real.
Verificación: 11 pruebas con PostgreSQL aislado y HTTP, cero fallos/omisiones. Chrome comprobó envío y navegación reales y ancho móvil. Lint focalizado limpio.
Bloqueos ajenos: build Turbopack EPERM en evaluación de CSS; build Webpack compila pero tipos globales detectan layout público vacío creado durante el turno. Lint global conserva problemas de admin/auth previos. No se modificó ese trabajo del usuario ni se ejecutó seed/migración en su base.
Verificación final: 11/11 pruebas aprobadas sin omisiones tras sincronizar carreras y añadir HTTP; Chrome escritorio/móvil nuevamente correcto. Tipos focalizados mediante configuración temporal que incluye los archivos modificados: pasan. Lint focalizado y git diff --check: pasan. Sin avisos de prerender/instant navigation en el servidor reiniciado tras los wrappers locales Suspense.
Segunda revisión del delta: sin errores confirmados; observaciones anteriores resueltas.
Feedback AGENTS.md: se intentó el comando de instrucciones una vez y su reintento con red; ambos indicaron que no podían comprobar disponibilidad. No se envió feedback ni datos del proyecto.
