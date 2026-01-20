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
│   │   ├── get-user.decorator.ts    # Extrae usuario del request
│   │   └── sanitize.decorator.ts    # Sanitización XSS
│   ├── dto/
│   │   ├── login.dto.ts
│   │   └── register.dto.ts
|   |   └── register.dto.ts
|   |
|   |──services/
|   |  ├──password-reset.dto.ts
│   │
|   |──entities/
|   |  ├──password-reset-code.entity.ts
|   |
│   ├── guards/
│   │   ├── jwt-auth.guard.ts        # Protección de rutas
│   │   └── seller.guard.ts          # Solo vendedores
|   |   └── google-auth.guard.ts     # Guard de Google ← NUEVO
│   └── strategies/
│       └── jwt.strategy.ts          # Estrategia JWT
│       └── google.strategy.ts
└── users/                     # Módulo de Usuarios
|    ├── users.module.ts
|    ├── users.controller.ts
|    ├── users.service.ts
|    ├── dto/
|    │   └── create-user.dto.ts
|    └── entities/
|        └── user.entity.ts|    │
├── admin/                     # Módulo de Administradores ← NUEVO
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
│   │   ├── admin-jwt.guard.ts        # Protección rutas admin
│   │   └── super-admin.guard.ts      # Solo super admins
│   └── strategies/
│       └── admin-jwt.strategy.ts     # Estrategia JWT admin
│
├── seller-requests/           # Módulo de Solicitudes de Vendedor ← NUEVO
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
├── common/                    # Servicios compartidos ← NUEVO
│   └── services/
│       └── cloudinary.service.ts     # Subida de imágenes
│
└── scripts/                   # Scripts utilitarios ← NUEVO
    └── create-admin.js               # Crear admin inicial
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

### 4. EmailService (brevo)

**Descripción:** Servicio para envío de emails transaccionales con Resend

**Método principal:**

#### `sendPasswordResetCode(email, code, userName)`

Envía email con código de recuperación de contraseña

**Características:**

- Plantilla HTML responsive con diseño de RaícesMX
- Código visible de 6 dígitos
- Advertencia de expiración (15 minutos)
- Compatible con todos los clientes de email

**Configuración:**

```typescript
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=onboarding@resend.dev
```

---

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

- [x] **Sistema de solicitudes**
  - Formulario de solicitud (CURP + INE)
  - Subida de imágenes a Cloudinary (conversión WebP)
  - Estados: pending, approved, rejected
  - Validación de documentos
  - Cookies separadas (admin_token vs access_token)

- [x] **Base de datos**
  - Tabla `admins` con roles (super_admin, admin)
  - Tabla `seller_requests` con documentos
  - Relaciones con usuarios

- [ ] **Panel de administrador (Frontend)** → SIGUIENTE
  - Dashboard con estadísticas
  - Lista de solicitudes pendientes
  - Aprobar/rechazar con razón
  - Ver documentos del solicitante
  - Gestión de usuarios

### 📋 Fase 2: Módulo de Productos (PRÓXIMO)

- [ ] CRUD de productos artesanales
- [ ] Categorías de productos
- [ ] Subida de imágenes (AWS S3 o Cloudinary)
- [ ] Búsqueda y filtros
- [ ] Sistema de inventario

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
  success: true,
  message: "¡Contraseña restablecida exitosamente!"
}
```

**Seguridad:**

- Hashea la nueva contraseña con bcrypt
- Marca el código como usado (no reutilizable)
- Valida requisitos de contraseña

```

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
