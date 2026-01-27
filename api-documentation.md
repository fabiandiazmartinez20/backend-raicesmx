# RaícesMX Backend - Documentación de API

**Marketplace de de productos Mexicanas**

---

## 📋 Índice

1. [Visión General](#visión-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Arquitectura](#arquitectura)
4. [Módulos](#módulos)
5. [API Endpoints](#api-endpoints)
6. [Seguridad](#seguridad)
7. [Base de Datos](#base-de-datos)
8. [Roadmap](#roadmap)

---

## Visión General

### Objetivo

Crear un marketplace seguro y escalable que conecte artesanos mexicanos con compradores globales, preservando y promoviendo la cultura artesanal de México.

### Propuesta de Valor

- **Para Artesanos:** Plataforma para vender sus productos con alcance nacional/internacional
- **Para Compradores:** Acceso a artesanías auténticas mexicanas con garantía de calidad
- **Para la Cultura:** Preservación y promoción del patrimonio artesanal mexicano

### Usuarios Objetivo

1. **Compradores:** Personas interesadas en artesanías auténticas
2. **Vendedores/Artesanos:** Creadores de artesanías que buscan expandir su mercado
3. **Administradores:** Gestión de la plataforma

---

## Stack Tecnológico

### Backend

- **Framework:** NestJS 10.x
- **Lenguaje:** TypeScript 5.7
- **ORM:** TypeORM
- **Base de Datos:** MySQL 8 (Railway)
- **Autenticación:** JWT + Passport
- **Validación:** class-validator + class-transformer
- **Seguridad:** Helmet, Cookie-parser
- **Documentación:** Compodoc

### Librerías Principales

```json
{
  "@nestjs/common": "^10.x",
  "@nestjs/jwt": "^10.x",
  "@nestjs/passport": "^10.x",
  "@nestjs/typeorm": "^10.x",
  "bcrypt": "^5.x",
  "cookie-parser": "^1.4.6",
  "helmet": "^7.x",
  "passport-jwt": "^4.x",
  "typeorm": "^0.3.x",
  "mysql2": "^3.x"
  "passport-google-oauth20": "^2.x",

}
```

---

## Arquitectura

### Estructura de Módulos

```
src/
├── main.ts                    # Bootstrap de la aplicación
├── app.module.ts              # Módulo raíz
├── app.controller.ts          # Controlador principal
├── app.service.ts             # Servicio principal
│
├── auth/                      # Módulo de Autenticación
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── decorators/
│   │   ├── get-user.decorator.ts
│   │   └── sanitize.decorator.ts
│   ├── dto/
│   │   ├── login.dto.ts
│   │   ├── register.dto.ts
│   │   └── password-reset.dto.ts
│   ├── entities/
│   │   └── password-reset-code.entity.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   ├── seller.guard.ts
│   │   └── google-auth.guard.ts
│   ├── strategies/
│   │   ├── jwt.strategy.ts
│   │   └── google.strategy.ts
│   └── services/
│       └── email.service.ts
│
├── users/
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   │   └── create-user.dto.ts
│   └── entities/
│       └── user.entity.ts
│
├── admin/
│   ├── admin.module.ts
│   ├── admin.controller.ts
│   ├── admin.service.ts
│   ├── dto/
│   │   ├── admin-login.dto.ts
│   │   ├── create-admin.dto.ts
│   │   └── update-admin.dto.ts
│   ├── entities/
│   │   └── admin.entity.ts
│   ├── guards/
│   │   ├── admin-jwt.guard.ts
│   │   └── super-admin.guard.ts
│   └── strategies/
│       └── admin-jwt.strategy.ts
│
├── seller-requests/
│   ├── seller-requests.module.ts
│   ├── seller-requests.controller.ts
│   ├── seller-requests.service.ts
│   ├── dto/
│   │   ├── create-seller-request.dto.ts
│   │   ├── review-seller-request.dto.ts
│   │   └── get-seller-requests.dto.ts
│   └── entities/
│       └── seller-request.entity.ts
│
├── products/                  # 👈 NUEVO - Sistema de Productos
│   ├── products.module.ts
│   ├── products.controller.ts
│   ├── products.service.ts
│   ├── dto/
│   │   ├── create-product.dto.ts
│   │   ├── update-product.dto.ts
│   │   └── get-products.dto.ts
│   └── entities/
│       ├── product.entity.ts
│       ├── product-image.entity.ts
│       └── category.entity.ts
│
├── common/                    # Servicios compartidos
│   ├── common.module.ts
│   ├── common.controller.ts   # 👈 NUEVO - Endpoints de geocodificación
│   └── services/
│       ├── cloudinary.service.ts
│       └── geocoding.service.ts  # 👈 NUEVO - Geocodificación mexicana
│
|
└── chatbot/
|    ├── chatbot.module.ts
|    ├── chatbot.controller.ts
|    ├── chatbot.service.ts
|    └── dto/
|        └── send-message.dto.ts
|
|
|└──cart/
├    | ── cart.module.ts
├    |── cart.controller.ts
├    |── cart.service.ts
├    └── entities/
│    ├── cart.entity.ts
│    └── cart-item.entity.ts
|    └── dto/
|    ├── apply-coupon.dto.ts
|    └── update-cart-item.dto.ts|
|
|
|
└── scripts/
    └── create-admin.js
```

### Patrón de Diseño

- **Arquitectura:** Modular (NestJS Modules)
- **Patrón:** MVC + Repository Pattern
- **Inyección de Dependencias:** Nativa de NestJS
- **Separación de Responsabilidades:** Controllers → Services → Repositories

---

## Módulos

### 1. AppModule (Raíz)

**Descripción:** Módulo principal que orquesta toda la aplicación

**Imports:**

- `ConfigModule` - Configuración de variables de entorno
- `TypeOrmModule` - Conexión a base de datos MySQL
- `UsersModule` - Gestión de usuarios
- `AuthModule` - Autenticación y autorización

**Configuración:**

```typescript
TypeOrmModule.forRoot({
  type: 'mysql',
  host: process.env.MYSQLHOST,
  port: Number(process.env.MYSQLPORT),
  username: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  synchronize: false,
  logging: true,
  ssl: { rejectUnauthorized: false },
});
```

---

### 2. AuthModule

**Descripción:** Gestiona autenticación con JWT y cookies HTTP-Only

**Endpoints:**

#### POST `/auth/register`

Registra un nuevo usuario en el sistema

**Request Body:**

```typescript
{
  email: string;        // Email único del usuario
  fullName: string;     // Nombre completo
  password: string;     // Contraseña (mínimo 6 caracteres)
  isSeller?: boolean;   // true = vendedor, false = comprador (default)
}
```

**Response (201):**

```typescript
{
  success: true,
  message: "¡Registro exitoso! Bienvenido a nuestro marketplace",
  user: {
    id: number,
    email: string,
    fullName: string,
    isSeller: boolean
  }
}
```

**Seguridad:**

- Sanitiza `email` y `fullName` para prevenir XSS
- Hashea contraseña con bcrypt (10 rounds)
- Establece cookie HTTP-Only con token JWT
- Valida unicidad de email

---

#### POST `/auth/login`

Autentica un usuario existente

**Request Body:**

```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**

```typescript
{
  success: true,
  message: "¡Bienvenido de nuevo, {fullName}!",
  user: {
    id: number,
    email: string,
    fullName: string,
    isSeller: boolean
  }
}
```

**Errores:**

- `401 Unauthorized` - Email o contraseña incorrectos

---

#### GET `/auth/profile`

Obtiene el perfil del usuario autenticado

**Headers Requeridos:**

```
Cookie: access_token=<jwt_token>
```

**Response (200):**

```typescript
{
  success: true,
  message: "Perfil obtenido correctamente",
  user: {
    id: number,
    email: string,
    isSeller: boolean
  }
}
```

---

#### POST `/auth/logout`

Cierra la sesión del usuario

**Response (200):**

```typescript
{
  success: true,
  message: "Sesión cerrada correctamente. ¡Hasta pronto!"
}
```

---

#### GET `/auth/google` 🌐

Inicia el flujo de autenticación con Google OAuth 2.0

**Flujo:**

1. Usuario hace click en "Continuar con Google"
2. Redirige automáticamente a la página de autorización de Google
3. Usuario inicia sesión en Google y autoriza la aplicación
4. Google redirige a `/auth/google/callback`

**Sin parámetros requeridos**

---

#### GET `/auth/google/callback` 🌐

Callback de Google OAuth - Procesa la autenticación

**Query Parameters (automáticos de Google):**

```typescript
{
  code: string; // Código de autorización de Google
  scope: string; // Permisos otorgados
}
```

**Flujo:**

1. Recibe código de autorización de Google
2. Valida el código y extrae información del usuario
3. Busca usuario por email en la base de datos
4. Si existe: Login automático
5. Si no existe: Crea cuenta nueva con datos de Google
6. Establece cookie HTTP-Only con JWT
7. Redirige a: `http://localhost:4200/marketplace?login=google-success`

**Datos extraídos de Google:**

- Email
- Nombre completo
- Foto de perfil (opcional)
- Google ID

**Response:**

- Redirección 302 al frontend con sesión activa

---

### 3. UsersModule

**Descripción:** CRUD de usuarios del sistema

**Endpoints:**

#### GET `/users`

Lista todos los usuarios

**Response (200):**

```typescript
{
  success: true,
  message: "Se encontraron {count} usuarios",
  count: number,
  users: User[]
}
```

---

#### GET `/users/me`

Obtiene el perfil del usuario actual

**Response (200):**

```typescript
{
  success: true,
  message: "Tu perfil se obtuvo correctamente",
  user: User
}
```

---

#### GET `/users/:id`

Obtiene un usuario por ID

**Response (200):**

```typescript
{
  success: true,
  message: "Usuario encontrado",
  user: User
}
```

---

---

## Sistema de Emails con Brevo

### **Emails Implementados**

#### **1. Recuperación de Contraseña**

- **Template:** HTML responsive con código de 6 dígitos
- **Expira:** 15 minutos
- **Trigger:** Usuario solicita recuperación de contraseña
- **Método:** `sendPasswordResetCode(email, code, userName)`

#### **2. Aprobación de Vendedor** ✨

- **Template:** HTML con diseño de celebración
- **Contenido:**
  - Mensaje de felicitación
  - Confirmación de cuenta activada
  - Botón "Ir a Mi Perfil"
  - Consejos para comenzar a vender
  - Iconos de funcionalidades disponibles
- **Trigger:** Admin aprueba solicitud de vendedor
- **Método:** `sendSellerApprovalEmail(email, userName)`

#### **3. Rechazo de Vendedor** ✨

- **Template:** HTML con diseño informativo
- **Contenido:**
  - Notificación de rechazo
  - Razón específica del rechazo
  - Recomendaciones para mejorar
  - Botón "Enviar Nueva Solicitud"
  - Consejos para documentación correcta
- **Trigger:** Admin rechaza solicitud con razón
- **Método:** `sendSellerRejectionEmail(email, userName, rejectionReason)`

### **Características de las Plantillas**

- ✅ Diseño responsive (mobile-first)
- ✅ Colores de marca (RaícesMX)
- ✅ Iconos y emojis para mejor UX
- ✅ Call-to-action claros
- ✅ Footer con información de copyright
- ✅ Manejo de errores robusto (no bloquea flujo principal)

### **Configuración de Brevo**

```env
BREVO_API_KEY=your_api_key_here
BREVO_FROM_EMAIL=noreply@raicesmx.com
BREVO_FROM_NAME=RaícesMX
```

### **Librería Utilizada**

```json
{
  "@getbrevo/brevo": "^2.0.0"
}
```

### **Flujo de Envío**

```typescript
// Backend: seller-requests.service.ts
async review(requestId: number, adminId: number, dto: ReviewSellerRequestDto) {
  // ... actualizar solicitud ...

  if (dto.status === 'approved') {
    await this.userRepository.update({ id: request.userId }, { isSeller: true });

    // ✨ Enviar email automático
    try {
      await this.emailService.sendSellerApprovalEmail(
        request.user.email,
        request.user.fullName
      );
      console.log('✅ Email de aprobación enviado');
    } catch (error) {
      console.error('❌ Error al enviar email:', error);
      // No bloquea el flujo principal
    }
  }
}
```

---

### 5. AdminModule

**Descripción:** Gestión de administradores del sistema

**Características:**

- Autenticación separada de usuarios (cookie: admin_token)
- Roles: super_admin y admin
- Dashboard con estadísticas
- Gestión de solicitudes de vendedor
- CRUD de administradores (solo super_admin)

**Guards:**

- `AdminJwtGuard` - Valida token de admin
- `SuperAdminGuard` - Solo super administradores

---

### 6. SellerRequestsModule

**Descripción:** Sistema de verificación de vendedores

**Flujo:**

1. Usuario envía solicitud (CURP + INE)
2. Imágenes se suben a Cloudinary (WebP, 80% calidad)
3. Solicitud queda pendiente
4. Admin revisa documentos
5. Admin aprueba → `user.isSeller = true`
6. Usuario puede publicar productos

---

### 7. CloudinaryService

**Descripción:** Servicio para subida de imágenes a Cloudinary

**Características:**

- Conversión automática a WebP
- Optimización de calidad (80%)
- Redimensionamiento máximo 1200x1200
- Eliminación de imágenes antiguas
- Organización en carpetas

**Configuración:**

```env
CLOUDINARY_CLOUD_NAME=tu_cloud_name
CLOUDINARY_API_KEY=123456789
CLOUDINARY_API_SECRET=xxxxxxxxxxxxxxx
```

## 🔐 Seguridad

### Medidas Implementadas

#### 1. Autenticación

- ✅ **JWT (JSON Web Tokens)** con expiración de 7 días
- ✅ **Cookies HTTP-Only** para prevenir acceso desde JavaScript (XSS)
- ✅ **bcrypt** para hasheo de contraseñas (10 rounds)

#### 2. Protección XSS (Cross-Site Scripting)

**Múltiples capas de defensa:**

**Frontend (Angular):**

```typescript
sanitizeInput(input: string): string {
  return input
    .replace(/&/g, '&')
    .replace(//g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, ''')
    .replace(/\//g, '/')
    .trim();
}
```

**Backend (NestJS):**

```typescript
// Decorador personalizado
@Sanitize()
export class RegisterDto {
  @Sanitize()
  @IsEmail()
  email: string;

  @Sanitize()
  @IsString()
  fullName: string;
}
```

#### 3. Validación de Datos

- ✅ **class-validator** para validación de DTOs
- ✅ **ValidationPipe** global con `whitelist: true`
- ✅ **forbidNonWhitelisted: true** para rechazar propiedades extras

#### 4. Headers de Seguridad (Helmet)

```typescript
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        // ...
      },
    },
  }),
);
```

**Headers establecidos:**

- `X-XSS-Protection: 1; mode=block`
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Content-Security-Policy`

#### 5. CORS

```typescript
app.enableCors({
  origin: 'http://localhost:4200',
  credentials: true,
  exposedHeaders: ['set-cookie'],
});
```

#### 6. Guards y Decoradores

**JwtAuthGuard:**

```typescript
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile(@Request() req) {
  return req.user;
}
```

**SellerGuard:**

```typescript
@UseGuards(JwtAuthGuard, SellerGuard)
@Get('sellers-only')
onlySellers() {
  return { message: 'Solo vendedores' };
}
```

**GetUser Decorator:**

```typescript
@Get('me')
getMyProfile(@GetUser() user) {
  return user;
}
```

#### 1.1. OAuth 2.0 con Google

- ✅ **Google OAuth 2.0** para inicio de sesión social
- ✅ **Scopes mínimos**: `email`, `profile` (principio de menor privilegio)
- ✅ **Creación automática de cuentas** con email verificado por Google
- ✅ **Sin contraseña local** para usuarios de Google (password aleatorio hasheado)
- ✅ **Estado CSRF** para prevenir ataques de redirección

**Configuración:**

```typescript
GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback',
  scope: ['email', 'profile'],
});
```

---

## Base de Datos

### Esquema MySQL

#### Tabla: `users`

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_seller BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_is_seller (is_seller)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**

- `id` - Identificador único autoincremental
- `email` - Email del usuario (único, indexado)
- `full_name` - Nombre completo (sanitizado)
- `password_hash` - Contraseña hasheada con bcrypt
- `is_seller` - Rol: `false` = comprador, `true` = vendedor
- `created_at` - Fecha de creación
- `updated_at` - Fecha de última actualización

---

---

#### Tabla: `password_reset_codes`

```sql
CREATE TABLE password_reset_codes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  code VARCHAR(6) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_code (user_id, code),
  INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**

- `id` - Identificador único autoincremental
- `user_id` - ID del usuario (relación con tabla users)
- `code` - Código de 6 dígitos generado aleatoriamente
- `expires_at` - Fecha de expiración (15 minutos desde creación)
- `used` - Marca si el código ya fue utilizado
- `created_at` - Fecha de creación del código

**Índices:**

- `idx_user_code` - Optimiza búsquedas por usuario y código
- `idx_expires` - Optimiza limpieza de códigos expirados

---

#### Tabla: `admins`

```sql
CREATE TABLE admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role ENUM('super_admin', 'admin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_email (email),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**

- `id` - Identificador único
- `email` - Email del administrador (único)
- `password_hash` - Contraseña hasheada
- `full_name` - Nombre completo
- `role` - Rol: super_admin (todos los permisos) o admin
- `is_active` - Estado de la cuenta

---

#### Tabla: `seller_requests`

```sql
CREATE TABLE seller_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  curp VARCHAR(18) NOT NULL,
  ine_front_url VARCHAR(500) NOT NULL,
  ine_back_url VARCHAR(500),
  ine_front_public_id VARCHAR(255) NOT NULL,
  ine_back_public_id VARCHAR(255),
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  rejection_reason TEXT,
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,

  INDEX idx_user_id (user_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

**Campos:**

- `user_id` - ID del usuario que solicita
- `curp` - CURP del solicitante
- `ine_front_url` - URL de imagen en Cloudinary (frontal)
- `ine_back_url` - URL de imagen en Cloudinary (reverso)
- `ine_front_public_id` - ID de Cloudinary para eliminar
- `ine_back_public_id` - ID de Cloudinary para eliminar
- `status` - Estado: pending, approved, rejected
- `rejection_reason` - Razón si fue rechazada
- `reviewed_by` - ID del admin que revisó
- `reviewed_at` - Fecha de revisión

### Entidad TypeORM

```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash: string;

  @Column({ name: 'is_seller', default: false })
  isSeller: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
```

---

## Roadmap

### ✅ Fase 1: Autenticación y Seguridad (COMPLETADO)

- [x] Sistema de registro de usuarios
- [x] Sistema de login con JWT
- [x] Google OAuth 2.0
- [x] Cookies HTTP-Only
- [x] Protección XSS completa (frontend + backend)
- [x] Guards de autenticación
- [x] Validación de datos
- [x] Helmet para headers de seguridad
- [x] CORS configurado
- [x] Base de datos en Railway
- [x] recuperacion de contraseña mediante envio de correos con bravo

### ✅ Fase 1.5: Sistema de Verificación de Vendedores (COMPLETADO)

- [x] **Backend completo de verificación**
  - AdminModule con autenticación separada
  - SellerRequestsModule para gestión de solicitudes
  - CloudinaryService para subida de imágenes en WebP
  - Guards de admin (AdminJwtGuard, SuperAdminGuard)
  - Script para crear administrador inicial
  - **EmailService con Brevo para notificaciones automáticas**

- [x] **Sistema de solicitudes**
  - Formulario de solicitud (CURP + INE)
  - Subida de imágenes a Cloudinary (conversión WebP)
  - Estados: pending, approved, rejected
  - Validación de documentos
  - Cookies separadas (admin_token vs access_token)

- [x] **Sistema de emails automáticos**
  - Email de aprobación de vendedor (plantilla HTML personalizada)
  - Email de rechazo con razón (plantilla HTML personalizada)
  - Integración con Brevo (antes Sendinblue)
  - Plantillas responsive y con diseño de marca

- [x] **Panel de administrador (Frontend Angular)**
  - Login de administradores (autenticación separada)
  - Dashboard con estadísticas en tiempo real
  - Navbar con navegación entre secciones
  - **Componente de Aprobaciones completo:**
    - Lista de solicitudes con filtros (pendientes, aprobadas, rechazadas, todas)
    - Visualización de documentos (INE frontal y reverso)
    - Aprobar solicitudes con confirmación
    - Rechazar solicitudes con modal y razón obligatoria
    - Modal de imagen ampliada para revisar documentos
    - Toast de notificaciones
    - Actualización automática después de aprobar/rechazar
  - Guards de protección de rutas (adminGuard)

- [x] **Frontend de usuarios actualizado**
  - CTA de vendedor se oculta si ya tiene solicitud pendiente/aprobada/rechazada
  - Botón "Publicar Producto" solo visible para vendedores aprobados
  - Verificación de permisos en tiempo real
  - Mensajes de estado según solicitud (pendiente, aprobada, rechazada)

- [x] **Base de datos**
  - Tabla `admins` con roles (super_admin, admin)
  - Tabla `seller_requests` con documentos e historial de revisión
  - Relaciones con usuarios y admins
  - Índices optimizados para búsquedas

### ✅ Fase 2: Módulo de Productos (COMPLETADO)

- [x] **Backend completo**
  - ProductsModule con CRUD completo
  - CategoryEntity con 11 categorías predefinidas
  - ProductEntity con ubicación completa
  - ProductImageEntity con URLs de Cloudinary
  - Subida de imágenes optimizadas (WebP, 80% calidad)
  - Sistema de filtros avanzados (categoría, precio, estado, búsqueda)
  - Paginación (12 productos por página)
  - Contador de vistas y ventas

- [x] **Sistema de geocodificación**
  - CommonModule con GeocodingService
  - Integración con MapTiler para geocodificación rápida
  - Respaldo con Nominatim (OpenStreetMap)
  - Endpoint público para códigos postales mexicanos
  - Geocodificación inversa (coordenadas → dirección)
  - Autocompletado de dirección con CP

- [x] **Frontend de publicación**
  - Formulario completo con validación en tiempo real
  - Mapa interactivo con MapLibre + MapTiler
  - Autocompletado de dirección por código postal
  - Select dinámico de colonias (21+ colonias por CP)
  - Subida de imágenes con preview (max 5)
  - Cálculo de comisión en tiempo real (10%)
  - Modal informativo de comisiones
  - Checklist visual de validación
  - Manejo de checkboxes de términos

- [x] **Integraciones**
  - Cloudinary para almacenamiento de imágenes
  - MapTiler para geocodificación y mapas
  - API de códigos postales mexicanos
  - Conversión automática a WebP

  - [x] **Sistema de chatbot con búsqueda de productos cercanos**
  - ChatbotModule con integración de Gemini AI
  - Detección inteligente de solicitudes de ubicación
  - Geolocalización automática (GPS para móviles)
  - Entrada manual de código postal (preciso para laptops/PCs)
  - Búsqueda por radio (50km) usando fórmula Haversine
  - Mapa interactivo con MapLibre GL + MapTiler
  - Marcadores personalizados (usuario azul, productos rojos numerados)
  - Popups con información del producto (imagen, precio, distancia)
  - Lista de productos debajo del mapa con botones de acción
  - Feedback visual con spinners y mensajes de estado
  - Sistema híbrido de ubicación para cualquier dispositivo

  ### ✅ Fase 2.5: Chatbot Inteligente con Búsqueda Geoespacial (COMPLETADO)

- [x] **Backend del chatbot**
  - Integración con Google Gemini AI (generación de respuestas)
  - Detección de palabras clave para productos cercanos
  - Endpoint `/chatbot/message` con respuestas tipadas (text, map_request, map_response)
  - Cache de respuestas comunes (5 minutos TTL)
  - Rate limiting (10 requests/minuto)
  - Endpoint `/geocoding/map-config` para exponer API Key de MapTiler
- [x] **Sistema de búsqueda geoespacial**
  - Endpoint `/products/nearby?lat=X&lng=Y&radius=50`
  - Fórmula Haversine para cálculo de distancias
  - Filtrado de productos por coordenadas válidas
  - Ordenamiento por distancia (más cercanos primero)
  - Agregación de distancia a cada producto

- [x] **Frontend del chatbot**
  - Componente standalone con diseño moderno
  - Sistema de mensajes tipados (user/bot)
  - Indicador de escritura animado
  - Preguntas sugeridas contextuales
  - Sidebar con categorías de ayuda y FAQs
  - TrackBy para optimización de rendimiento

- [x] **Sistema híbrido de ubicación**
  - **Opción 1:** Geolocalización automática (navigator.geolocation)
    - Ideal para móviles con GPS
    - Manejo de errores (permisos denegados, timeout, etc.)
  - **Opción 2:** Entrada manual de código postal
    - Ideal para laptops/PCs (más preciso)
    - Validación de 5 dígitos
    - Integración con endpoint `/geocoding/codigo-postal`
    - Feedback visual con spinner animado
- [x] **Mapa interactivo**
  - MapLibre GL integrado con MapTiler
  - Marcador azul para ubicación del usuario
  - Marcadores rojos numerados para productos
  - Popups con imagen, precio, distancia y ubicación
  - Ajuste automático de zoom (fitBounds)
  - Controles de navegación
  - Múltiples mapas en una conversación (caché de instancias)

- [x] **UX/UI del chatbot**
  - Diseño glassmorphism con backdrop blur
  - Gradientes modernos (purple-blue)
  - Animaciones de hover y estados
  - Toast de errores y confirmaciones
  - Mensajes de bienvenida personalizados
  - Botón de limpiar conversación
  - Contador de mensajes en tiempo real

### 📋 Fase 3: Sistema de Órdenes (PRÓXIMO)

- [ ] Carrito de compras
- [ ] Checkout
- [ ] Historial de órdenes
- [ ] Estados de orden (pendiente, pagado, enviado, entregado)
- [ ] Integración de pagos (Stripe, PayPal, Mercado Pago)

**Entidades sugeridas:**

```typescript
// Product Entity
{
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  images: string[];
  categoryId: number;
  sellerId: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Category Entity
{
  id: number;
  name: string;
  description: string;
  image: string;
  parentId?: number;
}
```

### Fase 3: Sistema de Órdenes

- [ ] Carrito de compras
- [ ] Checkout
- [ ] Historial de órdenes
- [ ] Estados de orden (pendiente, pagado, enviado, entregado)
- [ ] Integración de pagos (Stripe, PayPal, Mercado Pago)

### Fase 4: Reviews y Ratings

- [ ] Sistema de calificaciones (1-5 estrellas)
- [ ] Reviews de productos
- [ ] Reviews de vendedores
- [ ] Verificación de compra

### Fase 5: Panel de Admin

- [ ] Dashboard de estadísticas
- [ ] Gestión de usuarios
- [ ] Gestión de productos
- [ ] Reportes de ventas
- [ ] Moderación de contenido

### Fase 6: Funcionalidades Avanzadas

- [ ] Sistema de favoritos/wishlist
- [ ] Notificaciones (email, push)
- [ ] Chat entre comprador y vendedor
- [ ] Recuperación de contraseña
- [ ] Verificación de email
- [ ] Two-factor authentication (2FA)
- [ ] Sistema de cupones/descuentos
- [ ] Programa de referidos

---

### 📋 Fase pendiente: Panel de Administrador (EN DESARROLLO)

- [ ] **Frontend del panel admin**
  - Login de admin
  - Dashboard con estadísticas
  - Lista de solicitudes pendientes
  - Visualización de documentos (INE)
  - Aprobar/rechazar con razón
  - Gestión de usuarios
  - CRUD de administradores (super_admin)

- [ ] **Mejoras al sistema de solicitudes**
  - Notificaciones por email al aprobar/rechazar
  - Historial de solicitudes
  - Filtros avanzados

## Métricas Actuales

### Cobertura de Código

- **Controladores:** 3
- **Entidades:** 4(user, passwordresetcode, admin, sellerrequest)
- **Guards:** 5
- **DTOs:** 3
- **Decoradores:** 2
- **Archivos:** 35
- **Módulos:** 5 (users, auth, admin, sellerrequest, common)
- **Servicios:** 8
- **Endpoints Activos:** 10 (3 públicos + 7 protegidos)

### Endpoints Activos

- **Públicos:** 2 (`/auth/register`, `/auth/login`)
- **Protegidos:** 5 (requieren autenticación)

---

## Variables de Entorno

```env
# Base de datos MySQL (Railway)
MYSQLHOST=nozomi.proxy.rlwy.net
MYSQLPORT=27596
MYSQLUSER=root
MYSQLPASSWORD=<secret>
MYSQLDATABASE=railway

# JWT
JWT_SECRET=<secret>
JWT_EXPIRATION=7d

# Entorno
NODE_ENV=development
```

# Google OAuth

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# Frontend URL (para redirección)

FRONTEND_URL=http://localhost:4200

# O tu dominio verificado: noreply@raicesmx.com

# Por estas de Brevo:

BREVO_API_KEY=
BREVO_FROM_EMAIL=fabianquinnz16@gmail.com
BREVO_FROM_NAME=RaícesMX

# clouinary

CLOUDINARY_CLOUD_NAME=du74htavm
CLOUDINARY_API_KEY=227994212893761
CLOUDINARY_API_SECRET=3U6qhi3My-a1ujjFrV1EiaLyWHw

---

## Convenciones de Código

### Nomenclatura

- **Archivos:** kebab-case (`auth.service.ts`)
- **Clases:** PascalCase (`AuthService`)
- **Métodos:** camelCase (`findUserById`)
- **Constantes:** UPPER_SNAKE_CASE (`JWT_SECRET`)

### Estructura de DTOs

```typescript
export class CreateXDto {
  @IsString()
  @IsNotEmpty()
  field: string;
}
```

### Estructura de Servicios

```typescript
@Injectable()
export class XService {
  constructor(@InjectRepository(X) private repo: Repository) {}

  async create(dto: CreateXDto): Promise {}
  async findAll(): Promise {}
  async findOne(id: number): Promise {}
  async update(id: number, dto: UpdateXDto): Promise {}
  async remove(id: number): Promise {}
}
```

---

## Recursos Adicionales

- **Repositorio:** (GitHub link)

---

**Última actualización:** Enero 2026  
**Versión:** 1.0.0  
**Autor:** RaícesMX Team

````

---
## API Endpoints
---

#### POST `/auth/password-reset/request` 🔐

Solicita un código de recuperación de contraseña por email

**Request Body:**
```typescript
{
  email: string; // Email del usuario
}
````

**Response (200):**

```typescript
{
  success: true,
  message: "Código de recuperación enviado a tu email"
}
```

**Seguridad:**

- No revela si el email existe (previene enumeración de usuarios)
- Invalida códigos anteriores del mismo usuario
- Código expira en 15 minutos

---

#### POST `/auth/password-reset/verify` 🔐

Verifica que el código de recuperación sea válido

**Request Body:**

```typescript
{
  email: string;
  code: string; // Código de 6 dígitos
}
```

**Response (200):**

```typescript
{
  success: true,
  message: "Código verificado correctamente"
}
```

**Errores:**

- `401 Unauthorized` - Código inválido o expirado

---

#### POST `/auth/password-reset/reset` 🔐

Restablece la contraseña del usuario

**Request Body:**

```typescript
{
  email: string;
  code: string; // Código de 6 dígitos
  newPassword: string; // Nueva contraseña (mínimo 8 caracteres)
}
```

**Response (200):**

```typescript
{
  success:

- `401 Unauthorized` - Código inválido o expirado
true,
  message: "¡Contraseña restablecida exitosamente!"
}
```

**Seguridad:**

- Hashea la nueva contraseña con bcrypt
- Marca el código como usado (no reutilizable)
- Valida requisitos de contraseña

```

```

## API Endpoints - Chatbot

### **GET `/chatbot/greeting`** 🌐

Obtiene un saludo de bienvenida personalizado generado por Gemini AI

**Response (200):**

```typescript
{
  success: true,
  message: "¡Hola! Soy tu asistente...",
  timestamp: Date
}
```

---

### **POST `/chatbot/message`** 🌐

Envía un mensaje al chatbot y obtiene respuesta inteligente

**Request Body:**

```typescript
{
  message: string;
}
```

**Response (200):**

```typescript
{
  success: true,
  type: "text" | "map_request" | "map_response",
  message: string,
  timestamp: Date
}
```

**Tipos de respuesta:**

- `text`: Respuesta normal del chatbot
- `map_request`: Solicita ubicación del usuario para búsqueda
- `map_response`: (No usado en este endpoint)

---

### **GET `/products/nearby?lat=19.43&lng=-99.13&radius=50`** 🌐

Buscar productos cercanos a una ubicación usando fórmula Haversine

**Query Parameters:**

- `lat` (required): Latitud del usuario
- `lng` (required): Longitud del usuario
- `radius` (optional): Radio de búsqueda en km (default: 5, max: 50)

**Response (200):**

```typescript
{
  success: true,
  message: "Productos encontrados en 50km",
  count: number,
  userLocation: { lat: number, lng: number },
  radius: number,
  products: Product[] // Con propiedad adicional 'distance' en km
}
```

---

### **GET `/geocoding/map-config`** 🌐

Obtiene la configuración del mapa (API Key de MapTiler)

**Response (200):**

```typescript
{
  success: true,
  apiKey: string,
  styleUrl: string
}
```

---

### Endpoints de Administrador

#### POST `/admin/login` 🔐

Login de administradores (cookie separada: admin_token)

**Request Body:**

```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**

```typescript
{
  success: true,
  message: "¡Bienvenido, Administrador Principal!",
  admin: {
    id: number,
    email: string,
    fullName: string,
    role: "super_admin" | "admin"
  }
}
```

---

#### GET `/admin/dashboard/stats` 🛡️

Estadísticas del dashboard (requiere AdminJwtGuard)

**Response (200):**

```typescript
{
  success: true,
  stats: {
    totalUsers: number,
    totalSellers: number,
    totalBuyers: number,
    pendingRequests: number,
    approvedRequests: number,
    rejectedRequests: number,
    totalRequests: number
  }
}
```

---

#### GET `/admin/users` 🛡️

Lista todos los usuarios registrados

---

### Endpoints de Solicitudes de Vendedor

#### POST `/seller-requests` 🔐

Crear solicitud de vendedor (con imágenes)

**Request Body (multipart/form-data):**

```typescript
{
  curp: string;              // CURP de 18 caracteres
  ineFront: File;            // Imagen frontal INE (requerida)
  ineBack?: File;            // Imagen trasera INE (opcional)
}
```

**Response (201):**

```typescript
{
  success: true,
  message: "Solicitud enviada exitosamente. Recibirás una respuesta pronto.",
  request: {
    id: number,
    status: "pending",
    createdAt: Date
  }
}
```

**Características:**

- Sube imágenes a Cloudinary automáticamente
- Convierte a WebP con calidad 80%
- Máximo 5MB por imagen
- Solo 1 solicitud pendiente por usuario

---

#### GET `/seller-requests/me` 🔐

Obtiene la solicitud del usuario actual

**Response (200):**

```typescript
{
  success: true,
  hasRequest: boolean,
  request: {
    id: number,
    status: "pending" | "approved" | "rejected",
    curp: string,
    createdAt: Date,
    reviewedAt?: Date,
    rejectionReason?: string
  }
}
```

---

#### GET `/seller-requests?status=pending` 🛡️

Lista solicitudes (solo admin)

**Query Params:**

- `status`: "pending" | "approved" | "rejected" | "all"

---

#### PATCH `/seller-requests/:id/review` 🛡️

Aprobar o rechazar solicitud (solo admin)

**Request Body:**

```typescript
{
  status: "approved" | "rejected",
  rejectionReason?: string  // Requerido si status = "rejected"
}
```

**Acción:** Si aprobada, `user.isSeller = true`

---

## API Endpoints - Administradores

### **POST `/admin/login`** 🔐

Login de administradores (cookie separada: `admin_token`)

**Request Body:**

```typescript
{
  email: string;
  password: string;
}
```

**Response (200):**

```typescript
{
  success: true,
  message: "¡Bienvenido, Administrador Principal!",
  admin: {
    id: number,
    email: string,
    fullName: string,
    role: "super_admin" | "admin",
    isActive: boolean
  }
}
```

---

### **GET `/admin/profile`** 🛡️

Obtiene el perfil del admin autenticado (requiere AdminJwtGuard)

**Response (200):**

```typescript
{
  success: true,
  admin: {
    id: number,
    email: string,
    fullName: string,
    role: "super_admin" | "admin",
    isActive: boolean
  }
}
```

---

### **POST `/admin/logout`** 🛡️

Cierra la sesión del admin (elimina cookie `admin_token`)

**Response (200):**

```typescript
{
  success: true,
  message: "Sesión de administrador cerrada"
}
```

---

### **GET `/admin/dashboard/stats`** 🛡️

Obtiene estadísticas del dashboard

**Response (200):**

```typescript
{
  success: true,
  stats: {
    totalUsers: number,
    totalSellers: number,
    totalBuyers: number,
    pendingRequests: number,
    approvedRequests: number,
    rejectedRequests: number,
    totalRequests: number
  }
}
```

---

### **GET `/admin/users`** 🛡️

Lista todos los usuarios registrados

**Response (200):**

```typescript
{
  success: true,
  count: number,
  users: User[]
}
```

---

## API Endpoints - Solicitudes de Vendedor

### **POST `/seller-requests`** 🔐

Crear solicitud de vendedor (con imágenes)

**Request Body (multipart/form-data):**

```typescript
{
  curp: string;              // CURP de 18 caracteres
  ineFront: File;            // Imagen frontal INE (requerida, max 5MB)
  ineBack?: File;            // Imagen trasera INE (opcional, max 5MB)
}
```

**Response (201):**

```typescript
{
  success: true,
  message: "Solicitud enviada exitosamente. Recibirás una respuesta pronto.",
  request: {
    id: number,
    status: "pending",
    createdAt: Date
  }
}
```

**Validaciones:**

- Solo imágenes (JPEG, PNG, WebP)
- Máximo 5MB por imagen
- Solo 1 solicitud pendiente por usuario

---

### **GET `/seller-requests/me`** 🔐

Obtiene la solicitud del usuario actual

**Response (200):**

```typescript
{
  success: true,
  hasRequest: boolean,
  request: {
    id: number,
    status: "pending" | "approved" | "rejected",
    curp: string,
    createdAt: Date,
    reviewedAt?: Date,
    rejectionReason?: string
  } | null
}
```

---

### **GET `/seller-requests?status=pending`** 🛡️ (Admin)

Lista solicitudes con filtro opcional

**Query Params:**

- `status`: "pending" | "approved" | "rejected" | "all"

**Response (200):**

```typescript
{
  success: true,
  count: number,
  requests: [
    {
      id: number,
      userId: number,
      curp: string,
      ineFrontUrl: string,
      ineBackUrl?: string,
      status: "pending" | "approved" | "rejected",
      createdAt: Date,
      reviewedAt?: Date,
      rejectionReason?: string,
      user: {
        id: number,
        email: string,
        fullName: string
      }
    }
  ]
}
```

---

### **PATCH `/seller-requests/:id/review`** 🛡️ (Admin)

Aprobar o rechazar solicitud

**Request Body:**

```typescript
{
  status: "approved" | "rejected",
  rejectionReason?: string  // Requerido si status = "rejected"
}
```

**Response (200):**

```typescript
{
  success: true,
  message: "Solicitud aprobada. Usuario ahora es vendedor. Email de confirmación enviado.",
  request: { /* datos actualizados */ }
}
```

**Acciones automáticas:**

- Si aprobada: `user.isSeller = true` + **Email de felicitación enviado**
- Si rechazada: **Email de notificación con razón enviado**

---

### **DELETE `/seller-requests/:id`** 🛡️ (Admin)

Eliminar solicitud y sus imágenes de Cloudinary

**Response (200):**

```typescript
{
  success: true,
  message: "Solicitud eliminada correctamente"
}
```

## Métricas Actuales

### Cobertura de Código

- **Controladores:** 6 (Auth, Users, Admin, SellerRequests, Products, Common)
- **Entidades:** 7 (User, PasswordResetCode, Admin, SellerRequest, Product, ProductImage, Category)
- **Guards:** 6 (JwtAuth, SellerGuard, AdminJwt, SuperAdmin, GoogleAuth, adminGuard)
- **Servicios:** 12 (Auth, Users, Admin, SellerRequests, Products, Email, Cloudinary, Geocoding, PasswordReset)
- **DTOs:** 12
- **Estrategias:** 3 (JWT, AdminJWT, Google)
- **Archivos:** 75+
- **Módulos:** 7 (App, Users, Auth, Admin, SellerRequests, Products, Common)
- **Endpoints Activos:** 35+

### Endpoints por Categoría

- **Públicos:** 5 (register, login, google, productos, categorías, geocodificación)
- **Protegidos (Usuarios):** 12 (requieren JwtAuthGuard)
- **Protegidos (Vendedores):** 8 (requieren SellerGuard)
- **Protegidos (Admins):** 7 (requieren AdminJwtGuard)
- **Super Admin:** 3 (requieren SuperAdminGuard)

### Frontend

- **Componentes:** 9 (Login, Marketplace, Perfil, Navbar, VendedorFormulario, **PublicarProducto**, InicioAdmin, AprobacionesAdmin, NavbarAdmin)
- **Servicios:** 4 (AuthService usuario, AuthService admin, SellerRequestsService, **ProductsService**)
- **Guards:** 2 (authGuard usuario, adminGuard)
- **Páginas:** 7

### Frontend

- **Componentes:** 9 (Login, Marketplace, Perfil, Navbar, VendedorFormulario, **PublicarProducto**, InicioAdmin, AprobacionesAdmin, NavbarAdmin)
- **Servicios:** 4 (AuthService usuario, AuthService admin, SellerRequestsService, **ProductsService**)
- **Guards:** 2 (authGuard usuario, adminGuard)
- **Páginas:** 7

---

## 📦 MÓ DULO DE PRODUCTOS

### **Descripción**

Sistema completo de publicación y gestión de productos artesanales con:

- Geocodificación automática de direcciones mexicanas
- Subida de imágenes optimizadas a Cloudinary (WebP)
- Sistema de categorías
- Ubicación en mapa interactivo

---

### **Endpoints de Productos**

#### **POST `/products`** 🔒 (Solo vendedores)

Publicar un nuevo producto

**Request Body (multipart/form-data):**

```typescript
{
  titulo: string;              // 10-255 caracteres
  descripcion: string;         // 50-2000 caracteres
  categoryId: number;          // ID de categoría
  precio: number;              // Precio en MXN
  stock: number;               // Cantidad disponible
  unidad: 'pieza' | 'kg' | 'litro' | 'paquete' | 'docena';

  // Ubicación
  calle: string;
  numeroExterior: string;
  numeroInterior?: string;
  colonia: string;
  codigoPostal: string;        // 5 dígitos
  municipio: string;
  estado: string;
  referencia?: string;
  latitud: number;
  longitud: number;

  // Imágenes (FormData)
  imagenes: File[];            // Máx 5 imágenes, 5MB c/u
}
```

**Response (201):**

```typescript
{
  success: true,
  message: "¡Producto publicado exitosamente!",
  product: {
    id: number,
    titulo: string,
    precio: number,
    // ... resto de datos
    images: ProductImage[]
  }
}
```

---

#### **GET `/products`** 🌐 (Público)

Listar productos con filtros

**Query Parameters:**

```typescript
{
  categoryId?: number;         // Filtrar por categoría
  estado?: string;             // Filtrar por estado
  minPrecio?: number;          // Precio mínimo
  maxPrecio?: number;          // Precio máximo
  search?: string;             // Búsqueda en título/descripción
  ordenar?: 'recientes' | 'precio_asc' | 'precio_desc' | 'mas_vendidos';
  page?: number;               // Página (default: 1)
  limit?: number;              // Items por página (default: 12)
}
```

**Response (200):**

```typescript
{
  success: true,
  count: number,
  total: number,
  page: number,
  limit: number,
  products: Product[]
}
```

---

#### **GET `/products/categories`** 🌐 (Público)

Obtener todas las categorías

**Response (200):**

```typescript
{
  success: true,
  count: number,
  categories: [
    {
      id: number,
      nombre: string,
      descripcion: string,
      icono: string
    }
  ]
}
```

---

#### **GET `/products/my-products`** 🔒 (Solo vendedores)

Obtener productos del vendedor actual

**Response (200):**

```typescript
{
  success: true,
  count: number,
  products: Product[]
}
```

---

#### **GET `/products/:id`** 🌐 (Público)

Obtener detalle de un producto

**Response (200):**

```typescript
{
  success: true,
  product: {
    id: number,
    titulo: string,
    descripcion: string,
    precio: number,
    stock: number,
    // ... dirección completa
    images: ProductImage[],
    seller: { id, fullName, email },
    category: { id, nombre, icono },
    vistas: number,
    ventas: number
  }
}
```

---

#### **PATCH `/products/:id`** 🔒 (Solo dueño)

Actualizar producto

**Response (200):**

```typescript
{
  success: true,
  message: "Producto actualizado correctamente",
  product: Product
}
```

---

#### **DELETE `/products/:id`** 🔒 (Solo dueño)

Eliminar producto (también elimina imágenes de Cloudinary)

**Response (200):**

```typescript
{
  success: true,
  message: "Producto eliminado correctamente"
}
```

---

### **Geocodificación (Endpoints públicos)**

#### **GET `/geocoding/codigo-postal?cp=56700`** 🌐

Obtener datos de código postal mexicano

**Response (200):**

```typescript
{
  success: true,
  message: "Código postal encontrado",
  data: {
    colonia: string,
    municipio: string,
    estado: string,
    codigoPostal: string,
    latitud: number,
    longitud: number,
    colonias: string[]  // Todas las colonias del CP
  }
}
```

---

#### **GET `/geocoding/reverse?lat=19.4326&lng=-99.1332`** 🌐

Geocodificación inversa (coordenadas → dirección)

**Response (200):**

```typescript
{
  success: true,
  message: "Dirección obtenida",
  data: {
    colonia: string,
    municipio: string,
    estado: string
  }
}
```

---

### **Sistema de Imágenes**

- **Formato:** WebP automático (80% calidad)
- **Tamaño máximo:** 5MB por imagen
- **Cantidad:** 1-5 imágenes por producto
- **CDN:** Cloudinary
- **Organización:** `products/product_{id}/imagen_{index}.webp`
- **Eliminación:** Al borrar producto se eliminan de Cloudinary

---

### **Categorías predefinidas**

1. Artesanías Mexicanas
2. Textiles y Bordados
3. Cerámica y Barro
4. Joyería Tradicional
5. Muebles Típicos
6. Dulces Mexicanos
7. Bebidas Tradicionales
8. Instrumentos Musicales
9. Ropa Tradicional
10. Decoración Mexicana
11. Otros Productos

### Endpoints por Categoría

- **Públicos:** 8 (register, login, google, productos, categorías, geocodificación, nearby, map-config)
- **Protegidos (Usuarios):** 13 (requieren JwtAuthGuard)
- **Protegidos (Vendedores):** 9 (requieren SellerGuard)
- **Protegidos (Admins):** 8 (requieren AdminJwtGuard)
- **Super Admin:** 3 (requieren SuperAdminGuard)
- **Chatbot:** 4 (greeting, message, search, products-nearby)

### Frontend

- **Componentes:** 10 (...existentes + **Chatbot**)
- **Servicios:** 6 (...existentes + **ChatbotService**, **MapService**)
- **Guards:** 2 (authGuard usuario, adminGuard)
- **Páginas:** 8 (...existentes + **/chatbot**)

📋 RESUMEN DE IMPLEMENTACIONES - Sesión Marketplace + Carrito
🎯 IMPLEMENTACIONES COMPLETADAS

1. ✅ Sistema de Paginación en Marketplace
   Problema inicial: Los productos se cargaban pero el spinner se quedaba indefinidamente.
   Solución implementada:

Agregado ChangeDetectorRef para forzar actualización de vista
Implementado setTimeout() con 2 segundos de delay para mejor UX
Sistema de paginación completo con botones numéricos
Navegación: Anterior/Siguiente con validación
Puntos suspensivos (...) para muchas páginas
Info de paginación: "Mostrando X-Y de Z productos"
Scroll automático al cambiar de página

Archivos modificados:
src/app/marketplace/
├── marketplace.component.ts (Agregado ChangeDetectorRef + setTimeout)
├── marketplace.component.html (Sistema de paginación completo)
└── marketplace.component.scss (Estilos de paginación + spinner)
Características del spinner:

Dos círculos giratorios (rojo y dorado mexicano)
Ícono de Material Icons en el centro
Puntos animados "..."
Mensaje personalizable
Responsive automático
Modo oscuro incluido
Delay de 2 segundos para mejor experiencia visual

2. ✅ Vista de Detalle de Producto (view-product)
   Implementación: Componente completo para ver detalles de productos.
   Características implementadas:

Consumo de API real (ProductsService.getProductById())
Galería de imágenes interactiva con zoom
Navegación entre imágenes (flechas + miniaturas)
Información completa del producto desde la BD
Datos del vendedor real
Ubicación completa (colonia, municipio, estado, CP)
Control de stock en tiempo real
Productos relacionados de la misma categoría
Loading spinner mientras carga
Manejo de producto no encontrado (404)
Navegación automática entre productos
Botones deshabilitados si no hay stock

Archivos creados:
src/app/view-product/
├── view-product.component.ts (Lógica + consumo API)
├── view-product.html (Template completo)
└── view-product.scss (Estilos + loading + not-found)
Integración con Marketplace:
html<!-- En marketplace.component.html -->
<a class="btn-details" [routerLink]="['/producto', producto.id]">
<i class="material-icons">visibility</i>
Ver detalles
</a>

3. ✅ ProductsService Completo
   Problema: Faltaba el método getProductsByCategory() y otros métodos útiles.
   Métodos agregados:

searchProducts() - Buscar por texto
getProductsByCategory() - Filtrar por categoría
getProductsByPriceRange() - Filtrar por rango de precio
getProductsByEstado() - Filtrar por estado
getBestSellers() - Obtener más vendidos
getNewestProducts() - Obtener más recientes

Archivo actualizado:
src/app/service/products.service.ts

4. ✅ Fix del Chatbot - Código Postal
   Problema: El spinner se quedaba cargando infinitamente al ingresar código postal.
   Causa: El isLoadingPostalCode = false se ejecutaba después de fetchNearbyProducts(), que activaba su propio loading.
   Solución:
   typescript// ANTES (incorrecto)
   this.fetchNearbyProducts(lat, lng);
   this.isLoadingPostalCode = false; // ❌ Tarde

// DESPUÉS (correcto)
this.isLoadingPostalCode = false; // ✅ Primero
this.cdr.detectChanges();
this.fetchNearbyProducts(lat, lng); // ✅ Después
Mejoras adicionales:

Validación de response.data antes de usar
Mensajes de error más específicos (404, 0, etc)
Logs mejorados para debugging
cdr.detectChanges() en los lugares correctos

Archivo corregido:
src/app/chatbot/chatbot.component.ts

5. ✅ Sistema de Carrito de Compras (Implementado por ti)
   Tablas creadas en MySQL:
   Tabla carts:
   sqlCREATE TABLE `carts` (
   `id` INT NOT NULL AUTO_INCREMENT,
   `userId` INT NOT NULL,
   `subtotal` DECIMAL(10, 2) DEFAULT 0.00,
   `envio` DECIMAL(10, 2) DEFAULT 0.00,
   `descuento` DECIMAL(10, 2) DEFAULT 0.00,
   `total` DECIMAL(10, 2) DEFAULT 0.00,
   `codigoCupon` VARCHAR(50) NULL,
   `activo` TINYINT(1) DEFAULT 1,
   `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   UNIQUE KEY `idx_user_active_cart` (`userId`, `activo`),
   CONSTRAINT `fk_cart_user` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE
   );
   Tabla cart_items:
   sqlCREATE TABLE `cart_items` (
   `id` INT NOT NULL AUTO_INCREMENT,
   `cartId` INT NOT NULL,
   `productId` INT NOT NULL,
   `cantidad` INT DEFAULT 1,
   `precioUnitario` DECIMAL(10, 2) NOT NULL,
   `subtotal` DECIMAL(10, 2) NOT NULL,
   `createdAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
   `updatedAt` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
   PRIMARY KEY (`id`),
   UNIQUE KEY `idx_cart_product` (`cartId`, `productId`),
   CONSTRAINT `fk_cart_item_cart` FOREIGN KEY (`cartId`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
   CONSTRAINT `fk_cart_item_product` FOREIGN KEY (`productId`) REFERENCES `products` (`id`) ON DELETE CASCADE
   );
   Índices creados para rendimiento:
   sqlCREATE INDEX `idx_cart_user` ON `carts` (`userId`);
   CREATE INDEX `idx_cart_item_cart` ON `cart_items` (`cartId`);
   CREATE INDEX `idx_cart_item_product` ON `cart_items` (`productId`);

Funcionalidades del carrito:

✅ Agregar productos al carrito
✅ Actualizar cantidad de items
✅ Eliminar items del carrito
✅ Cálculo automático de subtotal, envío y total
✅ Sistema de cupones de descuento
✅ Un carrito activo por usuario
✅ Validación de stock al agregar productos
✅ Relaciones con usuarios y productos
✅ Soft delete con cascada

📊 ARQUITECTURA COMPLETA ACTUAL
Frontend (Angular 18)
src/app/
├── marketplace/ ← Marketplace con paginación
│ ├── marketplace.component.ts
│ ├── marketplace.html
│ └── marketplace.scss
├── view-product/ ← Vista detalle producto
│ ├── view-product.component.ts
│ ├── view-product.html
│ └── view-product.scss
├── chatbot/ ← Chatbot con mapas
│ ├── chatbot.component.ts
│ ├── chatbot.html
│ └── chatbot.scss
├── cart/ ← Carrito de compras (nuevo)
│ ├── cart.component.ts
│ ├── cart.html
│ └── cart.scss
└── service/
├── products.service.ts ← Servicio completo con 6+ métodos
├── chatbot.service.ts ← Servicio con mapas + CP
├── map.service.ts ← MapLibre GL JS
└── cart.service.ts ← Servicio del carrito (nuevo)
