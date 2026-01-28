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
) 

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


- Tabla de Administradores
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

-- Tabla de Solicitudes de Vendedor
CREATE TABLE seller_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  -- Información del solicitante
  curp VARCHAR(18) NOT NULL,
  -- URLs de imágenes en Cloudinary
  ine_front_url VARCHAR(500) NOT NULL,
  ine_back_url VARCHAR(500),
  -- IDs públicos de Cloudinary (para eliminar imágenes)
  ine_front_public_id VARCHAR(255) NOT NULL,
  ine_back_public_id VARCHAR(255),
  -- Estado de la solicitud
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  -- Razón de rechazo (opcional)
  rejection_reason TEXT,
  -- Admin que procesó la solicitud
  reviewed_by INT,
  reviewed_at TIMESTAMP NULL,
  -- Fechas
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  -- Relaciones
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES admins(id) ON DELETE SET NULL,
  -- Índices
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at),
  -- Un usuario solo puede tener una solicitud activa a la vez
  UNIQUE KEY unique_active_request (user_id, status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;









-- =====================================================
-- TABLA: categories
-- Categorías de productos del marketplace
-- =====================================================

CREATE TABLE categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL UNIQUE,
  descripcion TEXT,
  icono VARCHAR(100) COMMENT 'Font Awesome icon name',
  imagen_url VARCHAR(500),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  INDEX idx_nombre (nombre),
  INDEX idx_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar categorías iniciales
INSERT INTO categories (nombre, descripcion, icono) VALUES
('Artesanías Mexicanas', 'Productos hechos a mano con técnicas tradicionales', 'fa-hands'),
('Textiles y Bordados', 'Ropa y telas bordadas a mano', 'fa-shirt'),
('Cerámica y Barro', 'Piezas de barro negro, talavera, etc.', 'fa-vase'),
('Joyería Tradicional', 'Collares, aretes, pulseras artesanales', 'fa-gem'),
('Muebles Típicos', 'Muebles artesanales de madera', 'fa-couch'),
('Dulces Mexicanos', 'Dulces típicos regionales', 'fa-candy-cane'),
('Bebidas Tradicionales', 'Mezcal, tequila, pulque, etc.', 'fa-wine-bottle'),
('Instrumentos Musicales', 'Guitarras, maracas, tambores artesanales', 'fa-guitar'),
('Ropa Tradicional', 'Huipiles, rebozos, vestidos típicos', 'fa-vest'),
('Decoración Mexicana', 'Alebrijes, calaveras, artículos decorativos', 'fa-palette'),
('Otros Productos', 'Productos que no entran en las otras categorías', 'fa-box'),
('Productos Agrícolas', 'Frutas, verduras y productos del campo', 'fa-seedling');


-- =====================================================
-- TABLA: products
-- Productos publicados por vendedores
-- =====================================================
DROP TABLE IF EXISTS products;

CREATE TABLE products (
  id INT AUTO_INCREMENT PRIMARY KEY,

  -- Relaciones
  seller_id INT NOT NULL,
  category_id INT NOT NULL,

  -- Información básica
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,

  -- Precio y stock
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  unidad ENUM('pieza','kg','litro','paquete','docena') DEFAULT 'pieza',

  -- Ubicación
  estado VARCHAR(100) NOT NULL,
  municipio VARCHAR(255) NOT NULL,
  colonia VARCHAR(255) NOT NULL,
  codigo_postal VARCHAR(5) NOT NULL,
  calle VARCHAR(255) NOT NULL,
  numero_exterior VARCHAR(20) NOT NULL,
  numero_interior VARCHAR(20),
  referencia TEXT,

  -- Coordenadas
  latitud DECIMAL(10,8) NOT NULL,
  longitud DECIMAL(11,8) NOT NULL,

  -- Estado
  is_active BOOLEAN DEFAULT TRUE,
  is_featured BOOLEAN DEFAULT FALSE,

  -- Métricas
  vistas INT DEFAULT 0,
  ventas INT DEFAULT 0,

  -- Auditoría
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  -- Índices
  INDEX idx_seller (seller_id),
  INDEX idx_category (category_id),
  INDEX idx_active (is_active),
  INDEX idx_codigo_postal (codigo_postal),
  INDEX idx_estado (estado),
  INDEX idx_precio (precio),
  INDEX idx_created (created_at),

  -- Foreign keys
  CONSTRAINT fk_products_seller
    FOREIGN KEY (seller_id) REFERENCES users(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id)
    ON DELETE RESTRICT

) ENGINE=InnoDB
DEFAULT CHARSET=utf8mb4
COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: product_images
-- Imágenes de los productos (Cloudinary URLs)
-- =====================================================
CREATE TABLE product_images (
  id INT AUTO_INCREMENT PRIMARY KEY,
  product_id INT NOT NULL,
  
  -- URLs de Cloudinary (formato WebP optimizado)
  image_url VARCHAR(500) NOT NULL COMMENT 'URL completa de Cloudinary',
  public_id VARCHAR(255) NOT NULL COMMENT 'Public ID de Cloudinary (para eliminar)',
  
  -- Orden de visualización (0 = principal)
  orden INT DEFAULT 0 COMMENT '0 = imagen principal, 1+ = secundarias',
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
  
  INDEX idx_product (product_id),
  INDEX idx_orden (product_id, orden)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- =====================================================
-- VISTA: Productos con información completa
-- =====================================================
CREATE VIEW products_full AS
SELECT 
  p.*,
  u.full_name AS seller_name,
  u.email AS seller_email,
  c.nombre AS category_name,
  c.icono AS category_icon,
  (SELECT COUNT(*) FROM product_images WHERE product_id = p.id) AS total_images,
  (SELECT image_url FROM product_images WHERE product_id = p.id AND orden = 0 LIMIT 1) AS imagen_principal
FROM products p
INNER JOIN users u ON p.seller_id = u.id
INNER JOIN categories c ON p.category_id = c.id;

SELECT DATABASE();
SHOW tables;
SHOW FULL TABLES;

select * from categories;

DESCRIBE users;



-- =============================================
-- TABLA: carts (Carritos de compras)
-- =============================================
CREATE TABLE IF NOT EXISTS `carts` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: cart_items (Items del carrito)
-- =============================================
CREATE TABLE IF NOT EXISTS `cart_items` (
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ÍNDICES para mejor rendimiento
-- =============================================
CREATE INDEX `idx_cart_user` ON `carts` (`userId`);
CREATE INDEX `idx_cart_item_cart` ON `cart_items` (`cartId`);
CREATE INDEX `idx_cart_item_product` ON `cart_items` (`productId`);

-- =============================================
-- Comentarios de las tablas
-- =============================================
ALTER TABLE `carts` COMMENT = 'Carritos de compras de los usuarios';
ALTER TABLE `cart_items` COMMENT = 'Items individuales dentro de cada carrito';






-- =====================================================
-- TABLA: orders
-- Órdenes de compra
-- =====================================================

CREATE TABLE orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_number VARCHAR(50) UNIQUE NOT NULL,
  buyer_id INT NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  status ENUM('pending', 'paid', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',

  -- Shipping Information
  shipping_name VARCHAR(255) NOT NULL,
  shipping_email VARCHAR(255) NOT NULL,
  shipping_phone VARCHAR(20),
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_state VARCHAR(100) NOT NULL,
  shipping_postal_code VARCHAR(10) NOT NULL,
  shipping_country VARCHAR(100) DEFAULT 'México',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_buyer (buyer_id),
  INDEX idx_status (status),
  INDEX idx_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: order_items
-- Items de cada orden
-- =====================================================

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  product_id INT NOT NULL,
  product_title VARCHAR(255) NOT NULL,
  product_description TEXT,
  product_price DECIMAL(10,2) NOT NULL,
  quantity INT NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  product_image_url VARCHAR(500),
  seller_id INT NOT NULL,
  seller_name VARCHAR(255) NOT NULL,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_product (product_id),
  INDEX idx_seller (seller_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =====================================================
-- TABLA: payments
-- Pagos procesados
-- =====================================================

CREATE TABLE payments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  paypal_order_id VARCHAR(50) UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'MXN',
  status ENUM('pending', 'completed', 'failed', 'cancelled', 'refunded') DEFAULT 'pending',
  method ENUM('paypal') DEFAULT 'paypal',
  paypal_response JSON,
  paypal_payer_id VARCHAR(50),
  paypal_email VARCHAR(255),

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_order (order_id),
  INDEX idx_paypal_order (paypal_order_id),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;