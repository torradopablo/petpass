# Contexto del Proyecto - PetPass

## 📖 Resumen Ejecutivo

**PetPass** es una plataforma SaaS que permite a los dueños de mascotas crear perfiles digitales accesibles mediante códigos QR. Cuando alguien encuentra una mascota perdida y escanea su QR, puede ver la información de contacto del dueño y notificarle automáticamente con la ubicación del escaneo.

---

## 🎯 Problema que Resuelve

### Situación Actual
- Miles de mascotas se pierden cada año
- Los collares tradicionales con placas se pueden perder o dañar
- La información de contacto puede quedar desactualizada
- No hay forma de saber dónde fue vista la mascota por última vez

### Solución PetPass
- **QR Permanente**: Código impreso en collar o placa
- **Información Actualizable**: El dueño puede cambiar datos sin cambiar el QR
- **Notificación Instantánea**: Email automático cuando se escanea
- **Geolocalización**: Mapa de dónde fue encontrada la mascota
- **Acceso Universal**: Cualquier smartphone puede escanear el QR

---

## 👥 Usuarios Objetivo

### Primarios
- **Dueños de Mascotas**: Personas que quieren proteger a sus perros/gatos
- **Edad**: 25-55 años
- **Perfil**: Clase media, tech-savvy, preocupados por el bienestar animal

### Secundarios
- **Personas que Encuentran Mascotas**: Cualquiera con smartphone
- **Veterinarias**: Pueden escanear para contactar al dueño
- **Refugios de Animales**: Identificación rápida

---

## 💰 Modelo de Negocio

### Planes de Suscripción

#### 🆓 Gratuito
- **Precio**: $0/mes
- **Límites**: 1 mascota
- **Características**:
  - QR básico
  - Perfil público
  - Notificaciones por email
  - Sin historial de escaneos

#### 💚 Básico
- **Precio**: $4.999 ARS/mes (~$5 USD)
- **Límites**: Hasta 3 mascotas
- **Características**:
  - Todo lo de Gratuito
  - QR personalizado con logo
  - Historial de escaneos (24h)
  - Soporte prioritario

#### ⭐ Premium
- **Precio**: $9.999 ARS/mes (~$10 USD)
- **Límites**: Mascotas ilimitadas
- **Características**:
  - Todo lo de Básico
  - Rastreo en tiempo real (futuro)
  - Historial médico completo
  - Backup de documentos
  - Alertas SMS (futuro)

### Ingresos Adicionales
- **Collares con QR**: Venta de collares físicos con QR impreso
- **Placas Premium**: Placas metálicas grabadas con QR
- **API para Veterinarias**: Integración B2B

---

## 🚀 Roadmap del Producto

### ✅ Fase 1: MVP (Completado)
- [x] Autenticación (Email + Google)
- [x] CRUD de mascotas
- [x] Generación de QR
- [x] Perfil público
- [x] Geolocalización
- [x] Notificaciones por email
- [x] Planes de suscripción
- [x] Integración con Mercado Pago

### 🔄 Fase 2: Mejoras (En Progreso)
- [ ] Dashboard de analytics
- [ ] Historial de escaneos
- [ ] Exportar datos (PDF)
- [ ] Modo oscuro
- [ ] PWA (Progressive Web App)
- [ ] Notificaciones push

### 🔮 Fase 3: Expansión (Futuro)
- [ ] App móvil nativa (iOS/Android)
- [ ] Rastreo GPS en tiempo real
- [ ] Integración con veterinarias
- [ ] Marketplace de productos
- [ ] Red social de mascotas
- [ ] IA para recomendaciones de salud

---

## 🏗️ Decisiones Técnicas Clave

### ¿Por qué Serverless?
- **Escalabilidad**: Auto-scaling sin configuración
- **Costo**: Pay-per-use, ideal para startups
- **Mantenimiento**: Sin servidores que administrar
- **Deploy**: CI/CD automático con Vercel

### ¿Por qué Supabase?
- **Rapidez**: Backend completo en minutos
- **Auth**: Sistema de autenticación robusto
- **RLS**: Seguridad a nivel de base de datos
- **Real-time**: Suscripciones en tiempo real (futuro)
- **Costo**: Plan gratuito generoso

### ¿Por qué Vanilla JS?
- **Simplicidad**: Sin framework overhead
- **Performance**: Carga rápida, bundle pequeño
- **Aprendizaje**: Más fácil para nuevos devs
- **Flexibilidad**: Fácil migrar a framework después

### ¿Por qué Mercado Pago?
- **Mercado**: Líder en LATAM
- **Integración**: SDK simple
- **Métodos**: Tarjetas, efectivo, transferencias
- **Webhooks**: Notificaciones automáticas

---

## 📊 Métricas de Éxito

### KPIs Principales
1. **Usuarios Registrados**: Meta 1000 en 3 meses
2. **Tasa de Conversión**: 10% de free a paid
3. **Escaneos por Día**: Promedio de 50
4. **Churn Rate**: <5% mensual
5. **NPS**: >50

### Métricas Secundarias
- Tiempo promedio en la plataforma
- Mascotas registradas por usuario
- Tasa de apertura de emails
- Tiempo de respuesta al escaneo

---

## 🎨 Diseño y UX

### Principios de Diseño
1. **Mobile First**: Mayoría de escaneos desde móvil
2. **Simplicidad**: Flujo de 3 pasos para registrar mascota
3. **Confianza**: Diseño profesional, seguro
4. **Emocional**: Imágenes de mascotas, colores cálidos

### Paleta de Colores
- **Primary**: Verde (#10b981) - Naturaleza, vida
- **Secondary**: Azul (#3b82f6) - Confianza
- **Accent**: Amarillo (#fbbf24) - Premium
- **Neutral**: Grises - Profesionalismo

### Tipografía
- **Headings**: Inter Bold
- **Body**: Inter Regular
- **Monospace**: Fira Code (para códigos)

---

## 🔐 Consideraciones de Privacidad

### Datos Recopilados
- **Personales**: Email, nombre, teléfono
- **Mascotas**: Nombre, foto, info médica
- **Ubicación**: Solo al escanear QR (con permiso)

### Protección de Datos
- **Encriptación**: HTTPS en todas las comunicaciones
- **RLS**: Usuarios solo ven sus propios datos
- **GDPR**: Derecho a exportar/eliminar datos
- **Anonimización**: Datos de analytics sin PII

### Políticas
- Términos y Condiciones (futuro)
- Política de Privacidad (futuro)
- Consentimiento explícito para geolocalización

---

## 🌍 Mercado y Competencia

### Competidores
1. **PetLink**: Microchips, más caro
2. **Pawscout**: Bluetooth tags, rango limitado
3. **FidoAlert**: Similar pero sin geolocalización

### Ventaja Competitiva
- **Precio**: Más accesible que microchips
- **Tecnología**: QR universal vs Bluetooth
- **UX**: Interfaz más moderna
- **Localización**: Enfoque en LATAM

---

## 📈 Plan de Marketing

### Canales
1. **Redes Sociales**: Instagram, TikTok (contenido de mascotas)
2. **SEO**: Blog sobre cuidado de mascotas
3. **Veterinarias**: Partnerships B2B
4. **Influencers**: Pet influencers en Instagram
5. **Google Ads**: Keywords "mascota perdida"

### Estrategia de Contenido
- Tips de cuidado de mascotas
- Historias de éxito (mascotas encontradas)
- Tutoriales de uso
- Infografías sobre estadísticas de mascotas perdidas

---

## 🤝 Equipo y Roles

### Roles Actuales
- **Founder/Dev**: Desarrollo fullstack
- **Designer**: UI/UX (freelance)

### Roles Futuros
- **Marketing Manager**: Crecimiento
- **Customer Support**: Atención al cliente
- **Backend Dev**: Escalabilidad
- **Mobile Dev**: Apps nativas

---

## 💡 Aprendizajes y Pivots

### Decisiones Importantes
1. **Soft Delete**: Mantener datos para historial
2. **Fecha de Nacimiento**: Calcular edad automáticamente
3. **Especies Separadas**: Vacunas diferentes para perros/gatos
4. **QR Público**: Sin login requerido para escanear

### Cambios Realizados
- ~~Edad manual~~ → Fecha de nacimiento
- ~~Vacunas texto libre~~ → Checkboxes dinámicos
- ~~Delete permanente~~ → Soft delete
- ~~Un solo plan~~ → 3 tiers

---

## 📞 Contacto y Recursos

### Links Importantes
- **Producción**: https://petpass.vercel.app (futuro)
- **Staging**: https://petpass-staging.vercel.app
- **Docs**: https://docs.petpass.com (futuro)

### Soporte
- **Email**: soporte@petpass.com
- **WhatsApp**: +54 9 11 XXXX-XXXX
- **Discord**: discord.gg/petpass (comunidad)

---

## 📝 Notas Adicionales

### Tecnologías Consideradas pero No Usadas
- **Next.js**: Demasiado complejo para MVP
- **Stripe**: No popular en LATAM
- **Firebase**: Preferimos PostgreSQL
- **React**: Vanilla JS suficiente por ahora

### Deuda Técnica Conocida
- [ ] Falta testing automatizado
- [ ] No hay TypeScript
- [ ] Bundle no optimizado
- [ ] Sin caché de API
- [ ] Falta documentación de API

### Próximos Pasos Inmediatos
1. Agregar tests unitarios
2. Implementar analytics
3. Crear landing page de marketing
4. Configurar dominio personalizado
5. Lanzar beta cerrada
