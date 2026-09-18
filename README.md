# Turnero Frontend

Next.js 16 para la app de Turnero — pública (reserva de turnos) y backoffice (panel admin/empleado). React 19, App Router, shadcn/ui, Tailwind v4.

## Cómo levantar

### Requisitos

- Node.js 22+ (fijado en `.nvmrc`)
- npm
- Backend corriendo en `http://127.0.0.1:8000`

### Instalación

```bash
npm install
```

### Variables de entorno

Creá `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000/api
```

Si no se configura, la app usa datos mock en memoria (útil para probar el frontend sin backend).

### Levantar

```bash
npm run dev -- --port 3000
```

### URLs

| Ruta | Contenido |
|---|---|
| `http://localhost:3000` | Agenda pública (reserva de turnos sin login) |
| `http://localhost:3000/consultar` | Consulta de turnos por DNI |
| `http://localhost:3000/empleados/login` | Login del backoffice |

Credenciales de prueba (con el backend y el seed corriendo):
- Admin: `admin@turnero.com` / `secret`
- Empleados: usuarios de fábrica, password `password`

### Producción

```bash
npm ci
npm run build
npm run start -- --port 3000
```

En producción, configurá `NEXT_PUBLIC_API_URL=https://api.example.com/api` en `.env.production`.

## Funcionalidades

### Pública (sin login)
- Reserva de turnos: el cliente elige servicio, fecha y horario; el sistema asigna un profesional automáticamente.
- Confirmación de asistencia por email con link único.
- Consulta de turnos por DNI.

### Backoffice (con login)
- **Calendario** (`/empleados/calendario`): vista mensual estilo Google con turnos por día, filtros por profesional/servicio, detalle con acciones (cambiar estado, reprogramar).
- **Turnos** (`/empleados/turnos`): listado con filtros por fecha, estado, DNI y nombre de cliente. Cambio de estado con transiciones válidas.
- **Servicios** (`/empleados/servicios`): CRUD de servicios (admin).
- **Profesionales** (`/empleados/profesionales`): gestión de profesionales y disponibilidad.
- **Dashboard** (`/empleados/dashboard`): resumen del día.

## Stack

- **Framework**: Next.js 16 (App Router, Turbopack)
- **UI**: shadcn/ui (new-york), Tailwind CSS v4, Lucide icons
- **State**: @tanstack/react-query v5
- **Forms**: react-hook-form + zod
- **Auth**: Bearer token (Sanctum) en localStorage
