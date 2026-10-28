# FoodShare

Banco de alimentos fullstack con Next.js 16, React, TypeScript, Prisma 6 y PostgreSQL en Supabase. Los donantes registran alimentos, los beneficiarios los solicitan y el administrador revisa donaciones, entrega solicitudes y gestiona productos. No se consumen APIs externas de alimentos.

## Requisitos

- Node.js 22.9 o superior (22/24 LTS) y npm.
- Un proyecto Supabase con la contraseña de su base PostgreSQL.
- Docker Engine o Docker Desktop con Compose, si se usa la opción Docker.
- Git para obtener el repositorio. Ejecutar los comandos siguientes desde la carpeta que contiene `package.json`.

## Configurar Supabase y variables

1. Crear un proyecto Supabase y esperar a que su base esté disponible.
2. En **Connect**, copiar la conexión PostgreSQL. Para equipos con IPv4, usar **Session pooler**, puerto **5432**; la conexión directa también sirve si la red admite IPv6. Evitar el pooler transaccional de 6543 para las migraciones de este proyecto.
3. Copiar `.env.example` como `.env`. En Windows puede copiarse desde el explorador; en Linux/macOS: `cp .env.example .env`.
4. Completar `DATABASE_URL` con el usuario, host y contraseña de la conexión elegida. Codificar caracteres especiales de la contraseña en formato URL. Conservar `sslmode=require` para Supabase.
5. Generar DOS secretos distintos ejecutando dos veces `openssl rand -hex 32` y completar `JWT_ACCESS_SECRET` y `JWT_REFRESH_SECRET`. Si no se dispone de OpenSSL: `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`.
6. Mantener los vencimientos `15m` y `7d`, salvo que se quieran probar sesiones cortas. No subir `.env` al repositorio.

| Variable | Uso |
| --- | --- |
| `DATABASE_URL` | Conexión PostgreSQL, usada por Prisma y las migraciones |
| `JWT_ACCESS_SECRET` | Firma de access tokens |
| `JWT_REFRESH_SECRET` | Firma de refresh tokens, diferente al secreto anterior |
| `ACCESS_TOKEN_EXPIRES_IN` | Duración del access token, por defecto `15m` |
| `REFRESH_TOKEN_EXPIRES_IN` | Duración del refresh token, por defecto `7d` |
| `SEED_ALLOW_RESET` | Permite borrar y recrear datos de demostración; por defecto `false` |

Guías oficiales de conexión: [Prisma con Supabase](https://supabase.com/docs/guides/database/prisma) y [conexiones PostgreSQL](https://supabase.com/docs/guides/database/connecting-to-postgres).

## Ejecutar localmente

```bash
npm ci
npm run db:migrate
```

`npm ci` genera Prisma Client mediante `postinstall`. `npm run db:generate` permite regenerarlo manualmente después de cambiar el esquema. Las migraciones versionadas crean las tablas; no se necesita `prisma db push`.

Para cargar datos de ejemplo, SOLO en una base vacía o de demostración:

```bash
SEED_ALLOW_RESET=true npm run db:seed
```

El seed elimina los datos de FoodShare antes de recrearlos. En PowerShell se puede ejecutar `$env:SEED_ALLOW_RESET="true"`, luego `npm run db:seed` y finalmente `$env:SEED_ALLOW_RESET="false"`.

```bash
npm run dev
```

Abrir **http://localhost:3000**. Para producción local:

```bash
npm run build
npm start
```

La compilación usa Webpack y PostCSS/Tailwind, genera salida standalone y no necesita consultar la base. No descarga fuentes remotas.

## Ejecutar con Docker

Preparar `.env` del mismo modo. Docker utiliza Supabase, no crea ni modifica otra base automáticamente.

```bash
docker compose --profile tools build
# Aplicar migraciones en la base configurada:
docker compose run --rm tools npm run db:migrate
# Opcional y destructivo: solo base demo
# docker compose run --rm -e SEED_ALLOW_RESET=true tools npm run db:seed
docker compose up -d app
```

Abrir **http://localhost:3000**. Logs: `docker compose logs -f app`. Detener: `docker compose down`. Los datos permanecen en Supabase. La imagen ejecuta Node como usuario no root y contiene Prisma, sus binarios y los assets estáticos.

Las cookies llevan `secure` en producción. Para un despliegue accesible por otros equipos se necesita HTTPS; el navegador permite probar en el origen local `localhost`. No cambiar esta protección para publicar por HTTP.

## Cuentas de demostración

Disponibles únicamente después del seed:

| Rol | Correo | Contraseña de demostración |
| --- | --- | --- |
| Administrador | `admin@foodshare.org` | `Admin123!` |
| Donante | `donante1@gmail.com` | `example123!` |
| Beneficiario | `beneficiario1@gmail.com` | `example123!` |

También se crean `donante2@gmail.com` y `beneficiario2@gmail.com` con la contraseña de demostración. No reutilizar estas credenciales en una entrega publicada con datos reales. El registro público solo ofrece Donante o Beneficiario.

## Recorrido para revisar la prueba

1. Abrir `/`: Home estática con accesos directos. `/products` y `/products/[id]` consultan datos por petición y muestran stock real; las imágenes locales son ilustrativas.
2. Elegir **English** en el selector visible y recorrer las pantallas; volver a **Español**. La cookie conserva el idioma. Los textos introducidos por usuarios (nombres de productos, descripciones y motivos) conservan su idioma original.
3. Entrar como donante. Crear una donación con entero positivo y vencimiento de al menos 3 días; editar o cancelar mientras siga pendiente. El dashboard carga sus datos en el cliente.
4. Entrar como administrador. Crear/editar productos, revisar donaciones y consultar inventario. Solo las donaciones aprobadas y no vencidas suman stock.
5. Entrar como beneficiario. Solicitar productos; comprobar el límite GLOBAL de 20 unidades en los últimos 7 días. La reserva toma primero las donaciones con vencimiento más cercano.
6. Cancelar o rechazar una solicitud pendiente: devuelve disponibilidad a sus donaciones originales. Entregarla mantiene las unidades consumidas y muestra la cantidad entregada al donante.
7. Cambiar un id en una URL o llamar endpoints de otro rol: no permite consultar ni modificar registros ajenos. Un producto con donaciones o solicitudes no se puede eliminar.
8. En el dashboard del donante, revisar el indicador de días hasta vencimiento: se calcula al montar el componente según la fecha local y no cambia el HTML inicial durante la hidratación.
9. Para probar renovación automática, poner temporalmente `ACCESS_TOKEN_EXPIRES_IN=5s`, reiniciar la app, iniciar sesión, esperar y usar una acción privada. Proxy renueva antes de cargar páginas; las llamadas de cliente renuevan tras 401 y reintentan una vez. Restaurar `15m` al terminar.
10. Cerrar sesión. El refresh token se revoca en base y se eliminan ambas cookies, incluso si el access token venció.

## Estructura y decisiones

- `(public)`: Home SSG, catálogo/detalle con datos SSR y navbar/footer.
- `(auth)`: login y registro con layout centrado.
- `(private)`: dashboard CSR, alta/edición de donaciones y nuevas solicitudes.
- `(admin)`: panel con acceso exclusivo de administrador.
- `src/app/api`: route handlers de autenticación, categorías, productos, donaciones propias, solicitudes propias, moderación e inventario. Validan sesión/rol independientemente del proxy.
- `src/proxy.ts`: protección por ruta y rol con JWT; puede renovar la sesión antes de renderizar.
- `src/lib/requests.ts`: transacción Serializable de reserva y cupo; reintentos acotados ante conflictos.
- `src/lib/inventory.ts`: stock aprobado/no vencido menos reservas pendientes/entregadas.
- `src/lib/translations.ts` y `src/components/i18n`: diccionario ES/EN y contexto, sin librerías adicionales. Primer render español estable para mantener Home SSG; preferencia guardada aplicada al hidratar.
- Tokens únicamente en cookies httpOnly, secure en producción y sameSite lax; no se devuelven en JSON ni se guardan en localStorage. Las cookies vencen junto con sus JWT. Solo el hash del refresh se almacena en base; una cuenta tiene una sesión renovable vigente a la vez.

No hay una API externa de datos: los endpoints propios y las páginas SSR comparten consultas Prisma. Los códigos de error son 400, 401, 403, 404 y 409 según la causa, con cuerpo `{ "error": "mensaje" }`. Los errores inesperados responden 500 sin exponer detalles internos.

## Verificación

```bash
npm test
npm run lint
npx tsc --noEmit --incremental false
npm run build
```

Las pruebas rápidas presentes cubren permisos de rutas, destinos internos del login y traducciones. La comprobación manual completa se describe arriba. Ejecutar pruebas de escritura únicamente contra una base desechable, nunca contra datos reales.

## Problemas frecuentes

- **P1001/conexión:** comprobar contraseña, host, red y URL del Session pooler. La app utiliza solo `DATABASE_URL`; no requiere claves de Supabase Auth ni una API key.
- **Prisma Client inexistente:** ejecutar `npm run db:generate`.
- **Tablas inexistentes:** ejecutar `npm run db:migrate` contra la base correcta.
- **Seed bloqueado:** el borrado requiere `SEED_ALLOW_RESET=true`; no activarlo en una base que deba conservarse.
- **Cookies en producción remota:** utilizar HTTPS.
- **Docker no conecta al daemon:** iniciar Docker Engine/Desktop. Revisar `docker context ls`; si se utiliza Engine y la CLI apunta a un Desktop apagado, seleccionar `docker context use default`.
- **Puerto 3000 ocupado:** usar `npm run dev -- --port 3001` o cambiar el puerto publicado en Compose.

Explicación de negocio para sustentar: [docs/sustentacion-negocio.md](docs/sustentacion-negocio.md).
