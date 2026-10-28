# Cierre técnico de FoodShare

Usuario autoriza terminar los pendientes manteniendo código fácil de sustentar.

- [x] Español/inglés con diccionario local, contexto y selector visible en todos los layouts. Idioma persistido en cookie; primer render estable para mantener Home SSG y evitar hidratación incorrecta.
- [x] Proxy de Next 16 con JWT, roles por ruta y renovación segura cuando el access token vence. Los endpoints conservan su propia autorización.
- [x] Servicio compartido de refresh que valida JWT y hash persistido, nueva cookie httpOnly; fetch cliente reintenta una vez después de renovar; logout revoca y limpia incluso con access vencido.
- [x] Indicador de vencimiento calculado después del montaje según fecha local, traducido; sin datos privados de donantes en catálogo público.
- [x] Docker standalone con Prisma y OpenSSL, .dockerignore y .env.example sin secretos. Comandos reproducibles de generación, migraciones y seed; README completo para Supabase, local y Docker.
- [x] Verificar pruebas rápidas, tipos, lint, compilación, flujos reales con base aislada y navegador; comprobar Docker si hay daemon disponible y documentar cualquier bloqueo comprobado.

No ejecutar seed ni migraciones en base del usuario. Conservar sus cambios concurrentes y trabajar en checkout actual sin commits.

Evidencia: docs/superpowers/execution/2026-10-28-technical-completion.md.
