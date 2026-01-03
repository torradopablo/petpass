# PetPass - Identificación Inteligente para Mascotas

Plataforma SaaS fullstack para identificación de mascotas mediante QR, con geolocalización, suscripciones premium y notificaciones.

## Stack Tecnológico

- **Frontend**: HTML5, Tailwind CSS, JavaScript Vanilla.
- **Backend**: Node.js (Vercel Functions), Pattern Controller/Service/Repository.
- **Base de Datos**: Supabase (PostgreSQL + Auth).
- **Pagos**: Mercado Pago.
- **Imágenes**: Cloudinary.
- **Emails**: Resend.

## Estructura del Proyecto

```
/
├── api/                  # Vercel Serverless Functions (Entry points)
├── backend/              # Lógica de Negocio
│   ├── controllers/      # Controladores HTTP
│   ├── services/         # Lógica de negocio
│   ├── repositories/     # Acceso a datos (Supabase)
│   ├── webhooks/         # Webhooks externos
│   └── utils/            # Helpers (Mailer, Cloudinary)
├── frontend/             # Cliente Web
│   ├── index.html        # Landing + App
│   ├── pet.html          # Perfil público QR
│   └── js/               # Módulos JS
└── supabase/
    └── schema.sql        # Script de base de datos
```

## Configuración y Despliegue

### 1. Variables de Entorno

Crear un archivo `.env` (local) o configurar en Vercel:

```env
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
MP_ACCESS_TOKEN=...
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
RESEND_API_KEY=...
```

### 2. Base de Datos (Supabase)

1.  Crear un proyecto en Supabase.
2.  Ejecutar el script `supabase/schema.sql` en el SQL Editor de Supabase.
3.  Desactivar "Email Confirm" en Authentication -> Providers -> Email (opcional para pruebas rápidas).

### 3. Ejecución Local (Vercel CLI)

Instalar Vercel CLI:
```bash
npm i -g vercel
```

Iniciar servidor de desarrollo:
```bash
vercel dev
```

Esto servirá el frontend en `http://localhost:3000` y las funciones en `/api/*`.

### 4. Producción

Hacer push a GitHub y conectar con Vercel. El framework se detectará automáticamente (o configurar como "Other").
Asegurar que `api/` se despliegue como Serverless Functions.

## Funcionalidades Clave Implementadas

- **Auth**: Registro/Login con Magic Link o Google.
- **Mascotas**: CRUD completo, generación de fotos (placeholder/Cloudinary).
- **QR / Perfil Público**: Vista pública optimizada para móvil con botones de contacto rápidos.
- **Geolocalización**: Al escanear el QR, se guarda la ubicación y se notifica al dueño (simulado con mailer).
- **Pagos**: Integración con Mercado Pago para suscripciones.
