# LifeTrack Personal

LifeTrack es una aplicacion personal construida con Next.js, TypeScript y Supabase para gestionar tres pilares de vida: salud, carrera y cuidado personal.

## Stack

- Next.js App Router
- TypeScript
- Supabase Auth, Database y Storage
- Tailwind CSS
- Framer Motion
- Recharts
- Google Gemini API para estimacion nutricional

## Rutas principales

- `/login`: autenticacion de usuario.
- `/dashboard`: resumen general privado.
- `/pilares`: vista privada de pilares.
- `/pilares/salud`: seguimiento de salud.
- `/pilares/carrera`: proyectos, tareas, skills y evidencias.
- `/pilares/cuidado-personal`: rutinas y seguimiento personal.
- `/api/nutrition`: endpoint privado de servidor para estimacion nutricional con Gemini.

## Variables de entorno

Crea un archivo `.env.local` en la raiz del proyecto. No subas este archivo a Git.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GEMINI_API_KEY=
```

Notas:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son publicas para el cliente web, pero igual deben configurarse por entorno.
- `GEMINI_API_KEY` es privada y solo debe usarse del lado servidor.
- No uses ni expongas `service_role`, contrasenas de base de datos, tokens personales o secretos de Vercel en el frontend.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Validacion

```bash
npm run lint
npm run build
```

## Supabase

El proyecto local esta vinculado al proyecto Supabase de LifeTrack mediante `supabase/.temp/project-ref`.

Antes de hacer cambios de esquema o politicas:

- verifica el project ref;
- revisa RLS en tablas expuestas;
- revisa views y funciones `SECURITY DEFINER`;
- revisa politicas de Storage;
- genera o actualiza migraciones de forma controlada.

### Vencimientos de Data & Carrera

Las fechas se guardan en `projects.start_date` y `projects.end_date` (tipo `date`). La campanita deriva las alertas de los proyectos incompletos con fecha limite de manana o anterior, segun `America/Lima`. La migracion `20261008152506_career_deadline_mail_delivery.sql` agrega la validacion del rango y un registro privado para evitar correos duplicados. Ya fue aplicada al proyecto Supabase de LifeTrack; verifica el historial remoto antes de ejecutar `db push`, porque las migraciones de salud anteriores tienen marcas de tiempo locales distintas a las remotas.

Para activar los correos, configura **solo en el servidor** (en Vercel y, si corresponde, en `.env.local`):

- `CAREER_EMAIL_ENABLED=true`: activacion explicita, despues de configurar y probar el proveedor.
- `SUPABASE_SECRET_KEY`: clave secreta de LifeTrack para el servidor, nunca en el cliente. Tambien se acepta `SUPABASE_SERVICE_ROLE_KEY` heredada.
- `CRON_SECRET`: secreto aleatorio de al menos 16 caracteres para autenticar el cron de Vercel.
- `CAREER_ALERT_USER_ID`: UUID del usuario propietario de los proyectos que recibira las alertas.
- `CAREER_ALERT_EMAIL`: correo destinatario, cuando el propietario lo proporcione.
- `RESEND_API_KEY`: clave del proveedor de correo Resend.
- `RESEND_FROM_EMAIL`: remitente de un dominio verificado en Resend.

El correo esta pospuesto y permanece desactivado salvo que `CAREER_EMAIL_ENABLED=true` y todas las variables anteriores esten presentes; la campanita sigue funcionando. No hay un cron programado en Vercel en esta version. Cuando se decida activar el correo, agregar un cron autenticado para `/api/career-deadlines/check` a las 13:00 UTC (08:00 en Peru) y desplegarlo. Crear o modificar un proyecto ya solicita una comprobacion inmediata desde la sesion autenticada. El correo agrupa los proyectos pendientes, no permite cambios desde el mensaje y registra cada envio por proyecto, fecha limite y tipo de alerta.

## Seguridad local

- Las rutas `/dashboard`, `/dashboard/:path*`, `/pilares` y `/pilares/:path*` se protegen desde `src/proxy.ts`.
- `.env*` esta ignorado por Git.
- Los secretos privados no deben usar prefijo `NEXT_PUBLIC_`.
