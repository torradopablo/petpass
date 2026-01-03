# PetPass - Identificación Inteligente para Mascotas

Plataforma SaaS fullstack para identificación de mascotas mediante QR, con geolocalización, suscripciones premium y notificaciones en tiempo real.

## 🚀 Stack Tecnológico

- **Frontend**: HTML5, Tailwind CSS, JavaScript Vanilla (ES6 Modules)
- **Backend**: Node.js (Vercel Serverless Functions)
- **Base de Datos**: Supabase (PostgreSQL + Auth + RLS)
- **Pagos**: Mercado Pago
- **Imágenes**: Cloudinary / UI Avatars
- **Emails**: Resend
- **Hosting**: Vercel

## 📁 Estructura del Proyecto

```
/
├── api/                      # Vercel Serverless Functions (Entry points)
│   ├── orders.js
│   ├── payments.js
│   ├── pets.js
│   ├── scans.js
│   └── webhooks.js
├── backend/                  # Lógica de Negocio
│   ├── controllers/          # Controladores HTTP
│   ├── services/             # Lógica de negocio
│   ├── repositories/         # Acceso a datos (Supabase)
│   ├── webhooks/             # Webhooks externos (Mercado Pago)
│   └── utils/                # Helpers (Mailer, Cloudinary)
├── frontend/                 # Cliente Web
│   ├── index.html            # Landing + Dashboard
│   ├── pet.html              # Perfil público QR
│   └── js/                   # Módulos JavaScript
│       ├── auth.js
│       ├── dashboard.js
│       ├── pets.js
│       ├── payments.js
│       ├── profile.js
│       ├── supabaseClient.js
│       └── ui.js
├── scripts/
│   └── generate-env.js       # Inyección de variables de entorno al frontend
├── supabase/
│   └── schema.sql            # Script inicial de base de datos
└── vercel.json               # Configuración de rewrites
```

## 🗄️ Esquema de Base de Datos

### Tabla: `profiles`
Información pública de usuarios.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Referencia a `auth.users` |
| `email` | TEXT | Email del usuario |
| `full_name` | TEXT | Nombre completo |
| `avatar_url` | TEXT | URL del avatar |
| `phone` | TEXT | Teléfono de contacto |
| `subscription_tier` | TEXT | Plan actual: `free`, `basic`, `premium` |
| `subscription_status` | TEXT | Estado: `active`, `inactive`, `cancelled` |
| `updated_at` | TIMESTAMP | Última actualización |

**RLS Policies:**
- ✅ Lectura pública (para mostrar datos del dueño en QR)
- ✅ Inserción solo por el propio usuario
- ✅ Actualización solo por el propio usuario

---

### Tabla: `pets`
Registro de mascotas.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Identificador único |
| `owner_id` | UUID (FK → profiles.id) | Dueño de la mascota |
| `name` | TEXT | Nombre de la mascota |
| `species` | TEXT | `perro` o `gato` |
| `breed` | TEXT | Raza |
| `birth_date` | DATE | Fecha de nacimiento |
| `weight` | TEXT | Peso |
| `vaccines` | TEXT | Vacunas aplicadas (CSV) |
| `photo_url` | TEXT | URL de la foto |
| `medical_info` | TEXT | Información médica adicional |
| `is_premium` | BOOLEAN | Si es mascota premium |
| `deleted_at` | TIMESTAMP | Soft delete (NULL = activo) |
| `created_at` | TIMESTAMP | Fecha de creación |

**RLS Policies:**
- ✅ Lectura pública (para QR)
- ✅ Lectura privada (solo dueño ve sus mascotas)
- ✅ CRUD solo por el dueño

---

### Tabla: `scans`
Registro de escaneos de QR con geolocalización.

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | UUID (PK) | Identificador único |
| `pet_id` | UUID (FK → pets.id) | Mascota escaneada |
| `latitude` | FLOAT | Latitud del escaneo |
| `longitude` | FLOAT | Longitud del escaneo |
| `scanned_at` | TIMESTAMP | Fecha y hora del escaneo |

**RLS Policies:**
- ✅ Inserción pública (cualquiera puede escanear)
- ✅ Lectura solo por el dueño de la mascota

---

## ⚙️ Configuración y Despliegue

### 1. Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto:

```env
# Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key

# Mercado Pago
MP_ACCESS_TOKEN=tu-access-token
MP_PUBLIC_KEY=tu-public-key

# Cloudinary (Opcional)
CLOUDINARY_CLOUD_NAME=tu-cloud-name
CLOUDINARY_API_KEY=tu-api-key
CLOUDINARY_API_SECRET=tu-api-secret

# Resend (Emails)
RESEND_API_KEY=tu-resend-key
```

### 2. Base de Datos (Supabase)

1. Crear un proyecto en [Supabase](https://supabase.com)
2. Ejecutar el script `supabase/schema.sql` en el SQL Editor
3. Aplicar las migraciones en orden:
   - `migration.sql` - Campos adicionales (breed, age, weight, vaccines)
   - `migration_species.sql` - Campo species
   - `migration_birthdate.sql` - Campo birth_date
   - `migration_fix_relationship.sql` - FK pets → profiles
   - `migration_soft_delete.sql` - Campo deleted_at
   - `migration_subscriptions.sql` - Campos de suscripción

4. Configurar autenticación:
   - Habilitar **Email** y **Google OAuth**
   - Configurar Redirect URLs: `http://localhost:3001`, `https://tu-dominio.vercel.app`

### 3. Ejecución Local

Instalar dependencias:
```bash
npm install
```

Generar archivo de variables de entorno para el frontend:
```bash
node scripts/generate-env.js
```

Iniciar servidor de desarrollo:
```bash
npx vercel dev --listen 3001
```

El proyecto estará disponible en `http://localhost:3001`

### 4. Despliegue en Producción

1. Conectar el repositorio con Vercel
2. Configurar las variables de entorno en el dashboard de Vercel
3. Vercel detectará automáticamente la configuración
4. Las funciones en `/api` se desplegarán como Serverless Functions

---

## 🎯 Funcionalidades Implementadas

### Autenticación
- ✅ Login con Magic Link (email)
- ✅ Login con Google OAuth
- ✅ Gestión de sesiones con Supabase Auth

### Gestión de Mascotas
- ✅ CRUD completo de mascotas
- ✅ Selector de especie (Perro/Gato)
- ✅ Vacunas dinámicas según especie
- ✅ Cálculo automático de edad desde fecha de nacimiento
- ✅ Soft delete (baja lógica)
- ✅ Generación de QR code

### Perfil Público (QR)
- ✅ Vista pública optimizada para móvil
- ✅ Información de contacto del dueño
- ✅ Botones de llamada y WhatsApp
- ✅ Geolocalización al escanear
- ✅ Mapa de ubicación del escaneo

### Suscripciones
- ✅ 3 Planes: Gratuito, Básico ($4.999), Premium ($9.999)
- ✅ Integración con Mercado Pago
- ✅ Tracking de estado de suscripción
- ✅ UI de selección de planes

### Notificaciones
- ✅ Email al dueño cuando se escanea el QR
- ✅ Información de ubicación en la notificación

---

## 📚 Documentación Adicional

- [Arquitectura Técnica](./docs/ARCHITECTURE.md)
- [Guía de Buenas Prácticas](./docs/BEST_PRACTICES.md)
- [Contexto del Proyecto](./docs/PROJECT_CONTEXT.md)

---

## 🔐 Seguridad

- Row Level Security (RLS) habilitado en todas las tablas
- Validación de permisos en el backend
- Variables sensibles en `.env` (no commiteadas)
- CORS configurado correctamente
- Sanitización de inputs

---

## 📞 Soporte

Para reportar bugs o solicitar features, crear un issue en el repositorio.
