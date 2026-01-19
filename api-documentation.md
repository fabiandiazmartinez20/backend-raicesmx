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
|   |──service/
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
    ├── users.module.ts
    ├── users.controller.ts
    ├── users.service.ts
    ├── dto/
    │   └── create-user.dto.ts
    └── entities/
        └── user.entity.ts
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

### 4. EmailService (Resend)

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
- [x] recuperacion de contraseña mediante envio de correos con resend

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

## Métricas Actuales

### Cobertura de Código

- **Controladores:** 3
- **Entidades:** 1
- **Guards:** 2
- **DTOs:** 3
- **Decoradores:** 2
- **Archivos:** 25
- **Módulos:** 3
- **Servicios:** 6
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
