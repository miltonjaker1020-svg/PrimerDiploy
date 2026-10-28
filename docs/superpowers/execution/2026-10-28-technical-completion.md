# Cierre técnico: resultado

Plan: `docs/superpowers/plans/2026-10-28-technical-completion.md`.

## Implementado

- ES/EN en las vistas públicas, auth, privadas y administración, con selector visible y preferencia en cookie. Diccionario local y contexto sin dependencias de i18n. Los datos escritos por usuarios se conservan en su idioma original. SSR inicial estable en español; la preferencia se aplica después de hidratar y Home permanece SSG.
- Proxy en `src/proxy.ts` para dashboard, donaciones, solicitudes y admin. Valida firma/claims y rol; renueva access vencido con refresh/hash persistido y reenvía la cookie nueva al render de esa misma petición. Los handlers mantienen autorización independiente.
- Refresh compartido con hash, httpOnly/secure en producción/sameSite; token con jti para distinguir logins. Sin secretos de desarrollo como fallback; las cookies vencen según el exp de sus JWT. Nada de tokens en JSON ni localStorage. Logout revoca el refresh y limpia ambas cookies aun con access vencido.
- Fetch cliente comparte refresh entre llamadas, reintenta una sola vez tras 401. Retorno de login limitado a rutas internas conocidas.
- Indicador de vencimiento en dashboard del donante, calculado después de montar según calendario local y actualizado periódicamente. Mensajes ES/EN y HTML inicial sin diferencias de fecha.
- Docker Node 22 Debian/OpenSSL, herramientas para migraciones/seed y runner standalone sin root. `.dockerignore` excluye `.env` y otros archivos privados; `.env.example` está incluido y no ignorado por Git.
- PostCSS oficial de Tailwind para generar estilos en producción; build Webpack consistente, fuentes de sistema sin descargas externas.
- Scripts `db:migrate`, `db:seed`, `db:generate`; postinstall genera Prisma. Seed solo permite borrar cuando `SEED_ALLOW_RESET=true` e incluye solicitud rechazada.
- README con configuración Supabase, variables, credenciales demo, local/Docker, migraciones, seed, recorridos y solución de problemas.

## Evidencia

- `npm test`: inicialmente 7 pruebas aprobadas. Tras la eliminación concurrente de requests.test.ts se respetó el cambio y se actualizó el runner: las 3 pruebas restantes de permisos y traducciones pasan, sin omisiones.
- `npm run lint`: sin errores ni advertencias.
- TypeScript y build de producción aprobados; Home estática, contenido SSR de catálogo/detalle y proxy presentes en salida.
- Imagen Docker construida correctamente. Herramientas aplicaron las dos migraciones y ejecutaron seed contra PostgreSQL 16 aislado en una red temporal. Seed sin opt-in rechazado antes de borrar.
- Contenedor ejecutado con uid 1000, sin `/app/.env`; CSS de producción comprobado con utilidades Tailwind presentes. Compose validado sin mostrar secretos.
- HTTP real en Docker: anónimo redirigido, roles bloqueados, access vencido renovado en SSR, handler devuelve 401 sin access válido, refresh renueva por cookie sin token JSON, logout con access vencido revoca refresh y evita reutilización.
- Chrome contra Docker con access tokens de 2 segundos: ES/EN en todos los layouts, persistencia al navegar, etiquetas locales de vencimiento, acción que recibe 401 renueva y termina correctamente, logout y catálogo móvil sin desbordamiento. No se observaron errores de hidratación.
- Revisión independiente sin fallos bloqueantes. Detalle menor del error de logout al cambiar idioma corregido.

La verificación no aplicó migraciones ni seed en Supabase o en la base de datos del usuario. Los recursos temporales de Docker se retiran al terminar; las imágenes de verificación quedan disponibles localmente. Las herramientas de feedback de Next no pudieron comprobar disponibilidad, incluso después del reintento autorizado con red; no se envió contenido del proyecto.
