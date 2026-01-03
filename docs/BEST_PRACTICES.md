# Guía de Buenas Prácticas - PetPass

## 📋 Tabla de Contenidos
1. [Código](#código)
2. [Base de Datos](#base-de-datos)
3. [Seguridad](#seguridad)
4. [Git & Versionado](#git--versionado)
5. [API Design](#api-design)
6. [Frontend](#frontend)

---

## 💻 Código

### Nomenclatura

**JavaScript:**
```javascript
// ✅ BIEN - camelCase para variables y funciones
const userName = 'Pablo';
function getUserProfile() { }

// ✅ BIEN - PascalCase para clases y componentes
class PetService { }
const Payments = { };

// ✅ BIEN - UPPER_SNAKE_CASE para constantes
const MAX_PETS_FREE_TIER = 1;
const API_BASE_URL = 'https://api.example.com';

// ❌ MAL
const UserName = 'Pablo';  // No PascalCase para variables
function get_user_profile() { }  // No snake_case
```

**SQL:**
```sql
-- ✅ BIEN - snake_case para tablas y columnas
CREATE TABLE user_profiles (
    user_id UUID,
    created_at TIMESTAMP
);

-- ❌ MAL
CREATE TABLE UserProfiles (
    userId UUID,
    createdAt TIMESTAMP
);
```

### Estructura de Archivos

**Módulos ES6:**
```javascript
// ✅ BIEN - Un export por responsabilidad
export const Pets = {
    async loadPets() { },
    async addPet() { },
    async deletePet() { }
};

// ✅ BIEN - Imports explícitos
import { supabase } from './supabaseClient.js';
import { Auth } from './auth.js';

// ❌ MAL - Import de todo
import * as everything from './module.js';
```

### Manejo de Errores

```javascript
// ✅ BIEN - Try/catch con mensajes claros
async function addPet(data) {
    try {
        const { data: pet, error } = await supabase
            .from('pets')
            .insert([data]);
        
        if (error) throw error;
        
        UI.toast('Mascota agregada correctamente');
        return pet;
        
    } catch (error) {
        console.error('Error adding pet:', error);
        UI.toast('Error al agregar mascota: ' + error.message, 'error');
        throw error;  // Re-throw si el caller necesita manejarlo
    }
}

// ❌ MAL - Silenciar errores
async function addPet(data) {
    try {
        await supabase.from('pets').insert([data]);
    } catch (error) {
        // No hacer nada
    }
}
```

### Async/Await

```javascript
// ✅ BIEN - Async/await consistente
async function loadData() {
    const pets = await fetchPets();
    const profile = await fetchProfile();
    return { pets, profile };
}

// ✅ BIEN - Promise.all para operaciones paralelas
async function loadAllData() {
    const [pets, profile, scans] = await Promise.all([
        fetchPets(),
        fetchProfile(),
        fetchScans()
    ]);
    return { pets, profile, scans };
}

// ❌ MAL - Mezclar callbacks y promises
function loadData(callback) {
    fetchPets().then(pets => {
        callback(pets);
    });
}
```

---

## 🗄️ Base de Datos

### Migraciones

**Siempre crear migraciones para cambios de schema:**

```sql
-- ✅ BIEN - migration_add_deleted_at.sql
ALTER TABLE pets 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP WITH TIME ZONE;

-- Comentar el propósito
COMMENT ON COLUMN pets.deleted_at IS 'Soft delete timestamp';
```

**Orden de ejecución:**
1. Crear columnas nuevas como NULLABLE
2. Poblar datos si es necesario
3. Agregar constraints
4. Crear índices

```sql
-- Paso 1: Agregar columna
ALTER TABLE pets ADD COLUMN species TEXT;

-- Paso 2: Poblar datos existentes
UPDATE pets SET species = 'perro' WHERE species IS NULL;

-- Paso 3: Agregar constraint
ALTER TABLE pets ALTER COLUMN species SET NOT NULL;
ALTER TABLE pets ALTER COLUMN species SET DEFAULT 'perro';

-- Paso 4: Índice si es necesario
CREATE INDEX idx_pets_species ON pets(species);
```

### Queries Eficientes

```javascript
// ✅ BIEN - Select solo columnas necesarias
const { data } = await supabase
    .from('pets')
    .select('id, name, photo_url')
    .eq('owner_id', userId);

// ✅ BIEN - Usar índices
const { data } = await supabase
    .from('pets')
    .select('*')
    .eq('owner_id', userId)  // Columna indexada
    .is('deleted_at', null);

// ❌ MAL - Select * innecesario
const { data } = await supabase
    .from('pets')
    .select('*');  // Trae todo sin filtros
```

### Row Level Security (RLS)

```sql
-- ✅ BIEN - Políticas específicas por operación
CREATE POLICY "Users can view own pets"
ON pets FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Users can insert own pets"
ON pets FOR INSERT
WITH CHECK (auth.uid() = owner_id);

-- ✅ BIEN - Políticas públicas explícitas
CREATE POLICY "Public can view pets for QR"
ON pets FOR SELECT
USING (true);  -- Explícitamente público

-- ❌ MAL - Política muy permisiva
CREATE POLICY "Allow all"
ON pets FOR ALL
USING (true);
```

---

## 🔒 Seguridad

### Variables de Entorno

```javascript
// ✅ BIEN - Nunca hardcodear credenciales
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// ✅ BIEN - Validar variables requeridas
if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing required environment variables');
}

// ❌ MAL
const supabaseUrl = 'https://abc123.supabase.co';
const supabaseKey = 'eyJhbGc...';  // NUNCA
```

### Sanitización de Inputs

```javascript
// ✅ BIEN - Validar antes de insertar
function validatePetData(data) {
    if (!data.name || data.name.trim().length === 0) {
        throw new Error('Name is required');
    }
    
    if (data.weight && isNaN(parseFloat(data.weight))) {
        throw new Error('Weight must be a number');
    }
    
    return {
        name: data.name.trim(),
        weight: data.weight ? parseFloat(data.weight) : null
    };
}

// ❌ MAL - Insertar sin validar
await supabase.from('pets').insert([formData]);
```

### Autenticación

```javascript
// ✅ BIEN - Verificar autenticación en cada request
async function protectedEndpoint(req, res) {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Continuar con la lógica
}

// ❌ MAL - Confiar en el cliente
async function protectedEndpoint(req, res) {
    const userId = req.body.userId;  // Cliente puede falsificar esto
    // ...
}
```

---

## 🌿 Git & Versionado

### Commits

```bash
# ✅ BIEN - Mensajes descriptivos
git commit -m "feat: add soft delete for pets"
git commit -m "fix: correct age calculation for pets under 1 year"
git commit -m "docs: update README with database schema"

# ✅ BIEN - Commits atómicos (un cambio lógico)
git commit -m "refactor: extract payment logic to service layer"

# ❌ MAL
git commit -m "changes"
git commit -m "fix stuff"
git commit -m "wip"  # Work in progress - no commitear
```

### Branches

```bash
# ✅ BIEN - Nombres descriptivos
git checkout -b feature/subscription-plans
git checkout -b fix/qr-code-loading
git checkout -b refactor/payment-service

# ❌ MAL
git checkout -b test
git checkout -b new-branch
git checkout -b pablo
```

### .gitignore

```gitignore
# ✅ BIEN - Nunca commitear
.env
.env.local
node_modules/
.vercel/
*.log

# ✅ BIEN - Archivos de IDE
.vscode/
.idea/
*.swp
```

---

## 🌐 API Design

### RESTful Endpoints

```javascript
// ✅ BIEN - Nombres en plural, verbos HTTP
GET    /api/pets           // Listar
POST   /api/pets           // Crear
GET    /api/pets/:id       // Obtener uno
PUT    /api/pets/:id       // Actualizar completo
PATCH  /api/pets/:id       // Actualizar parcial
DELETE /api/pets/:id       // Eliminar

// ❌ MAL
GET /api/getPets
POST /api/createPet
GET /api/pet/:id
```

### Respuestas Consistentes

```javascript
// ✅ BIEN - Estructura consistente
// Éxito
res.status(200).json({
    data: pets,
    count: pets.length
});

// Error
res.status(400).json({
    error: 'Invalid input',
    details: validationErrors
});

// ❌ MAL - Inconsistente
res.json(pets);  // A veces array
res.json({ pets });  // A veces objeto
res.json({ success: true, data: pets });  // A veces con success
```

### Status Codes

```javascript
// ✅ BIEN - Códigos apropiados
200 - OK (GET, PUT, PATCH exitosos)
201 - Created (POST exitoso)
204 - No Content (DELETE exitoso)
400 - Bad Request (validación falló)
401 - Unauthorized (no autenticado)
403 - Forbidden (autenticado pero sin permisos)
404 - Not Found
500 - Internal Server Error

// ❌ MAL - Siempre 200
res.status(200).json({ error: 'Not found' });  // Debería ser 404
```

---

## 🎨 Frontend

### HTML Semántico

```html
<!-- ✅ BIEN -->
<header>
    <nav>
        <ul>
            <li><a href="#pets">Mascotas</a></li>
        </ul>
    </nav>
</header>

<main>
    <section id="pets">
        <h2>Mis Mascotas</h2>
        <article class="pet-card">
            <h3>Firulais</h3>
        </article>
    </section>
</main>

<!-- ❌ MAL -->
<div class="header">
    <div class="nav">
        <div class="link">Mascotas</div>
    </div>
</div>
```

### Accesibilidad

```html
<!-- ✅ BIEN -->
<button aria-label="Eliminar mascota" onclick="deletePet('123')">
    <svg aria-hidden="true">...</svg>
</button>

<img src="pet.jpg" alt="Firulais, perro golden retriever">

<!-- ❌ MAL -->
<div onclick="deletePet('123')">X</div>
<img src="pet.jpg">  <!-- Sin alt -->
```

### Performance

```javascript
// ✅ BIEN - Debounce para inputs
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}

const searchPets = debounce(async (query) => {
    const results = await fetchPets(query);
    renderResults(results);
}, 300);

// ✅ BIEN - Lazy loading de imágenes
<img src="pet.jpg" loading="lazy" alt="Pet">

// ❌ MAL - Fetch en cada keystroke
input.addEventListener('input', async (e) => {
    await fetchPets(e.target.value);  // Demasiadas requests
});
```

---

## 📝 Documentación

### Comentarios

```javascript
// ✅ BIEN - Comentar el "por qué", no el "qué"
// Usamos soft delete para mantener historial de escaneos
const { error } = await supabase
    .from('pets')
    .update({ deleted_at: new Date() })
    .eq('id', petId);

// ✅ BIEN - JSDoc para funciones públicas
/**
 * Calcula la edad de una mascota desde su fecha de nacimiento
 * @param {Date} birthDate - Fecha de nacimiento
 * @returns {string} Edad formateada (ej: "2 años" o "6 meses")
 */
function calculateAge(birthDate) { }

// ❌ MAL - Comentarios obvios
// Obtener el nombre
const name = pet.name;
```

### README

```markdown
# ✅ BIEN - README completo
- Descripción del proyecto
- Stack tecnológico
- Instalación paso a paso
- Variables de entorno
- Comandos disponibles
- Estructura del proyecto
- Contribución

# ❌ MAL - README vacío o desactualizado
# Mi Proyecto
Proyecto de mascotas.
```

---

## 🧪 Testing

```javascript
// ✅ BIEN - Tests descriptivos
describe('Pet Service', () => {
    it('should create a pet with valid data', async () => {
        const pet = await PetService.create(validPetData);
        expect(pet.id).toBeDefined();
    });
    
    it('should throw error when name is missing', async () => {
        await expect(PetService.create({}))
            .rejects.toThrow('Name is required');
    });
});

// ❌ MAL
it('test 1', () => { });
it('works', () => { });
```

---

## 📊 Monitoreo

```javascript
// ✅ BIEN - Logging estructurado
console.log('[PetService] Creating pet', { userId, petName });
console.error('[PetService] Failed to create pet', { error, userId });

// ✅ BIEN - Métricas importantes
const startTime = Date.now();
await expensiveOperation();
const duration = Date.now() - startTime;
console.log('[Performance] Operation took', duration, 'ms');

// ❌ MAL
console.log('creating pet');
console.log(error);  // Sin contexto
```
