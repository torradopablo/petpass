# Contexto Técnico - PetPass

## Stack y Tecnologías

### Frontend
- **Framework**: Vanilla JavaScript (ES6 Modules)
- **Estilos**: Tailwind CSS (CDN)
- **Estructura**: SPA (Single Page Application)
- **Módulos principales**:
  - `auth.js`: Autenticación con Supabase
  - `pets.js`: CRUD de mascotas
  - `payments.js`: Integración Mercado Pago
  - `profile.js`: Perfil público (QR)
  - `dashboard.js`: Orquestación del dashboard
  - `ui.js`: Componentes y utilidades UI

### Backend
- **Runtime**: Node.js 18+
- **Arquitectura**: Serverless Functions (Vercel)
- **Patrón**: Controller → Service → Repository
- **Endpoints**:
  - `/api/pets` - CRUD mascotas
  - `/api/scans` - Registro de escaneos QR
  - `/api/payments` - Preferencias de pago
  - `/api/webhooks` - Webhooks de Mercado Pago
  - `/api/orders` - Gestión de pedidos

### Base de Datos
- **Motor**: PostgreSQL (Supabase)
- **ORM**: Supabase Client SDK
- **Seguridad**: Row Level Security (RLS)
- **Tablas principales**:
  - `profiles`: Datos públicos de usuarios
  - `pets`: Registro de mascotas
  - `scans`: Historial de escaneos QR

## Esquema de Base de Datos

### profiles
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  phone TEXT,
  subscription_tier TEXT DEFAULT 'free',
  subscription_status TEXT DEFAULT 'active',
  updated_at TIMESTAMPTZ
);
```

### pets
```sql
CREATE TABLE pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  species TEXT DEFAULT 'perro',
  breed TEXT,
  birth_date DATE,
  weight TEXT,
  vaccines TEXT,
  photo_url TEXT,
  medical_info TEXT,
  is_premium BOOLEAN DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### scans
```sql
CREATE TABLE scans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID REFERENCES pets(id),
  latitude FLOAT,
  longitude FLOAT,
  scanned_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Políticas RLS Importantes

### Lectura Pública (para QR)
```sql
-- Profiles: Lectura pública para mostrar datos del dueño
CREATE POLICY "Public profiles viewable" 
ON profiles FOR SELECT USING (true);

-- Pets: Lectura pública para QR
CREATE POLICY "Public can view pets" 
ON pets FOR SELECT USING (true);
```

### Lectura Privada (Dashboard)
```sql
-- Pets: Solo el dueño ve sus mascotas
CREATE POLICY "Users view own pets" 
ON pets FOR SELECT 
USING (auth.uid() = owner_id AND deleted_at IS NULL);
```

### Escritura
```sql
-- Solo el dueño puede modificar sus mascotas
CREATE POLICY "Users manage own pets" 
ON pets FOR ALL 
USING (auth.uid() = owner_id);
```

## Flujos Críticos

### 1. Registro de Mascota
```
Usuario → Dashboard → pets.js.addPet() 
  → Validación de datos
  → Supabase.insert('pets')
  → RLS verifica owner_id = auth.uid()
  → Retorna mascota creada
  → Recarga lista de mascotas
```

### 2. Escaneo de QR
```
Escáner → pet.html?id=xxx
  → profile.js.loadProfile()
  → Fetch pet + owner (JOIN con profiles)
  → Solicita geolocalización
  → POST /api/scans con lat/lng
  → Trigger email al dueño
  → Muestra mapa de ubicación
```

### 3. Suscripción
```
Usuario → Configuración → Selecciona plan
  → payments.js.subscribe(plan)
  → POST /api/payments/create-preference
  → Mercado Pago SDK abre modal
  → Usuario paga
  → Webhook → /api/webhooks
  → Actualiza profiles.subscription_tier
```

## Variables de Entorno Críticas

```bash
# Supabase (REQUERIDO)
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Mercado Pago (REQUERIDO para pagos)
MP_ACCESS_TOKEN=APP_USR-xxx
MP_PUBLIC_KEY=APP_USR-xxx

# Resend (REQUERIDO para emails)
RESEND_API_KEY=re_xxx

# Cloudinary (OPCIONAL - usando UI Avatars por ahora)
CLOUDINARY_CLOUD_NAME=xxx
CLOUDINARY_API_KEY=xxx
CLOUDINARY_API_SECRET=xxx
```

## Comandos Importantes

```bash
# Desarrollo local
npx vercel dev --listen 3001

# Generar env.js para frontend
node scripts/generate-env.js

# Instalar dependencias
npm install

# Deploy a producción
vercel --prod
```

## Migraciones Aplicadas

1. `migration.sql` - Campos adicionales (breed, age, weight, vaccines)
2. `migration_species.sql` - Campo species
3. `migration_birthdate.sql` - Campo birth_date
4. `migration_fix_relationship.sql` - FK pets → profiles
5. `migration_soft_delete.sql` - Campo deleted_at
6. `migration_subscriptions.sql` - Campos subscription_tier/status

## Consideraciones Técnicas

### Soft Delete
- Las mascotas NO se eliminan físicamente
- Se marca `deleted_at = NOW()`
- Queries filtran `WHERE deleted_at IS NULL`
- Permite mantener historial de escaneos

### Cálculo de Edad
- Se usa `birth_date` (DATE)
- Cálculo en frontend (pets.js y profile.js)
- Formato: "X años" o "X meses"
- Fallback a campo `age` (legacy) si no hay birth_date

### Vacunas Dinámicas
- Diferentes por especie (perro/gato)
- Almacenadas como CSV en campo `vaccines`
- Renderizado dinámico con checkboxes

### QR Code
- Generado con API externa: `https://api.qrserver.com/v1/create-qr-code/`
- URL del QR: `https://petpass.com/pet.html?id={pet_id}`
- Sin autenticación requerida para ver perfil público

## Debugging

### Logs Importantes
```javascript
// Frontend
console.log('[Auth] User logged in:', user);
console.log('[Pets] Loading pets for user:', userId);
console.error('[Payments] Error creating preference:', error);

// Backend
console.log('[ScanService] Recording scan:', { petId, lat, lng });
console.error('[EmailService] Failed to send:', error);
```

### Errores Comunes

1. **"PGRST200: Could not find relationship"**
   - Falta FK entre pets y profiles
   - Solución: Ejecutar `migration_fix_relationship.sql`

2. **"Row Level Security policy violation"**
   - Usuario no autenticado o sin permisos
   - Verificar `auth.uid()` en políticas

3. **"Missing environment variables"**
   - `.env` no cargado o incompleto
   - Ejecutar `node scripts/generate-env.js`

## Próximas Mejoras Técnicas

- [ ] Migrar a TypeScript
- [ ] Implementar tests (Jest + Playwright)
- [ ] Agregar caché con Redis
- [ ] Optimizar bundle (Vite/Webpack)
- [ ] Implementar Service Worker (PWA)
- [ ] Real-time con Supabase Realtime
