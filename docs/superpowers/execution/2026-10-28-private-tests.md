# Verificación del flujo privado

## Pruebas rápidas

`npm test` ejecuta las reglas de cantidades, stock y reservas FEFO. Las suites de PostgreSQL y HTTP se omiten si no se configuran sus variables.

## Integración con PostgreSQL

Utilizar exclusivamente una base desechable de pruebas. No ejecutar el seed del proyecto ni apuntar las variables a una base con datos reales.

```bash
DATABASE_URL="$TEST_DATABASE_URL" npx prisma migrate deploy
TEST_DATABASE_URL="$TEST_DATABASE_URL" npm test
```

La suite crea registros propios con identificadores únicos y elimina únicamente esos registros al terminar. Verifica cupo por producto y beneficiario, ventana móvil de 7 días con frontera incluida, estados, FEFO, rollback, rol persistido y concurrencia. Las carreras sincronizan dos lecturas y comprueban que ocurrió un reintento real por conflicto Serializable.

## Contrato HTTP

Iniciar Next en otro terminal con la misma base desechable:

```bash
DATABASE_URL="$TEST_DATABASE_URL" npm run dev -- --hostname 127.0.0.1 --port 3109
```

Luego ejecutar:

```bash
TEST_APP_URL="http://127.0.0.1:3109" TEST_DATABASE_URL="$TEST_DATABASE_URL" npm test
```

La suite HTTP comprueba login, cookie inválida/ausente, permisos, JSON inválido, cantidades, producto inexistente, cupo, identidad y estado impuestos por servidor, reserva persistida y privacidad del dashboard.

## Comprobaciones adicionales

- Lint de los archivos modificados: `npx eslint 'src/app/(private)' src/app/api/requests src/lib/requests*.ts src/lib/request-rules.ts src/types/requests.ts scripts/test.ts`.
- Tipos: `npx tsc --noEmit --incremental false`.
- Proyecto completo: `npm run lint` y `npm run build`.
- En navegador: elegir producto, solicitar una cantidad, comprobar regreso al dashboard y repetir en ancho móvil. También revisar catálogo vacío, conflicto de stock y sesión vencida.

## Evidencia de esta ejecución

- PostgreSQL 16 temporal, creado bajo `/tmp`, sin utilizar la base del usuario ni ejecutar el seed.
- 11 pruebas aprobadas, sin omisiones al proporcionar ambas variables, incluidas carreras sincronizadas y HTTP real.
- Chrome: formulario hidratado, selección, cantidad, envío real, navegación a dashboard y ancho móvil 390 px comprobados.
- Los tipos y el lint focalizados pasan. No hay avisos de prerender o navegación instantánea tras añadir Suspense dentro de cada página. El estado de catálogo vacío se revisó en código, sin prueba específica de navegador. El lint global tiene errores previos en administración y advertencias en otros archivos.
- Build Turbopack bloqueado por EPERM al abrir su puerto interno en este entorno. Webpack compila, pero su comprobación de tipos encuentra `src/app/(public)/layout.tsx` vacío, fuera del alcance modificado. Los archivos públicos aparecieron durante la ejecución y se conservaron.
