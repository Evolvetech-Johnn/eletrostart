CREATE DATABASE IF NOT EXISTS eletrostart_db;
USE eletrostart_db;

-- Usuários Administrativos
CREATE TABLE IF NOT EXISTS admin_users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    role VARCHAR(50) DEFAULT 'ADMIN',
    active TINYINT(1) DEFAULT 1,
    lastLogin DATETIME,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tags para classificação
CREATE TABLE IF NOT EXISTS tags (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    color VARCHAR(20) DEFAULT '#222998',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mensagens de Contato
CREATE TABLE IF NOT EXISTS contact_messages (
    id VARCHAR(36) PRIMARY KEY,
    source VARCHAR(100) DEFAULT 'contact_form',
    name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    subject VARCHAR(500),
    message TEXT NOT NULL,
    
    -- Discord Sync Metadata
    discordSent TINYINT(1) DEFAULT 0,
    discordMessageId VARCHAR(100),
    discordChannel VARCHAR(100),
    sentAt DATETIME,
    syncError TEXT,
    
    status VARCHAR(50) DEFAULT 'NEW',
    priority VARCHAR(20) DEFAULT 'MEDIUM',
    
    -- Internal Management
    notes TEXT,
    assignedToId VARCHAR(36),
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (assignedToId) REFERENCES admin_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabela de junção: Mensagens <-> Tags (Many-to-Many)
CREATE TABLE IF NOT EXISTS contact_messages_tags (
    messageId VARCHAR(36) NOT NULL,
    tagId VARCHAR(36) NOT NULL,
    PRIMARY KEY (messageId, tagId),
    FOREIGN KEY (messageId) REFERENCES contact_messages(id) ON DELETE CASCADE,
    FOREIGN KEY (tagId) REFERENCES tags(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log de Auditoria
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    action VARCHAR(100) NOT NULL,
    details TEXT,
    
    userId VARCHAR(36),
    targetId VARCHAR(36),
    targetType VARCHAR(50),
    messageId VARCHAR(36),
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES admin_users(id) ON DELETE SET NULL,
    FOREIGN KEY (messageId) REFERENCES contact_messages(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Log de Integração (Discord, etc)
CREATE TABLE IF NOT EXISTS integration_logs (
    id VARCHAR(36) PRIMARY KEY,
    service VARCHAR(50) DEFAULT 'DISCORD',
    status VARCHAR(20) NOT NULL,
    details TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Categorias de Produtos
CREATE TABLE IF NOT EXISTS categories (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image VARCHAR(500),
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Produtos
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    sku VARCHAR(100) UNIQUE,
    image VARCHAR(500),
    unit VARCHAR(20) DEFAULT 'un',
    
    categoryId VARCHAR(36),
    
    active TINYINT(1) DEFAULT 1,
    featured TINYINT(1) DEFAULT 0,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (categoryId) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(36) PRIMARY KEY,
    
    -- Informações do Cliente
    customerName VARCHAR(255) NOT NULL,
    customerEmail VARCHAR(255) NOT NULL,
    customerPhone VARCHAR(50),
    customerDoc VARCHAR(20),
    
    -- Endereço de Entrega
    addressZip VARCHAR(20),
    addressStreet VARCHAR(500),
    addressNumber VARCHAR(20),
    addressComp VARCHAR(100),
    addressCity VARCHAR(100),
    addressState VARCHAR(50),
    
    -- Totais
    subtotal DECIMAL(10,2) DEFAULT 0.00,
    shippingCost DECIMAL(10,2) DEFAULT 0.00,
    discount DECIMAL(10,2) DEFAULT 0.00,
    total DECIMAL(10,2) DEFAULT 0.00,
    
    -- Status e Pagamento
    status VARCHAR(50) DEFAULT 'PENDING',
    paymentMethod VARCHAR(50),
    paymentStatus VARCHAR(50) DEFAULT 'PENDING',
    
    notes TEXT,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Itens do Pedido
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(36) PRIMARY KEY,
    
    orderId VARCHAR(36) NOT NULL,
    productId VARCHAR(36),
    
    productName VARCHAR(255) NOT NULL,
    quantity INT NOT NULL,
    unitPrice DECIMAL(10,2) NOT NULL,
    totalPrice DECIMAL(10,2) NOT NULL,
    
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Índices
CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_createdAt ON contact_messages(createdAt);
CREATE INDEX IF NOT EXISTS idx_products_categoryId ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
