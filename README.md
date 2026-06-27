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

## Seguridad local

- Las rutas `/dashboard`, `/dashboard/:path*`, `/pilares` y `/pilares/:path*` se protegen desde `src/proxy.ts`.
- `.env*` esta ignorado por Git.
- Los secretos privados no deben usar prefijo `NEXT_PUBLIC_`.
