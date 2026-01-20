#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Eletrostart - MySQL Database Setup Script
==========================================

Este script automatiza a configuração do MySQL para o projeto Eletrostart.
Funcionalidades:
- Instala dependências Python automaticamente
- Verifica se o MySQL Server está rodando
- Cria o banco de dados e todas as tabelas
- Cria um admin padrão (opcional)
- Atualiza o arquivo .env com as credenciais

Uso:
    python setup_mysql.py
"""

import subprocess
import sys
import os
import uuid
import urllib.parse
from datetime import datetime

# =============================================================================
# Instalação automática de dependências
# =============================================================================

def install_dependencies():
    """Instala as dependências Python necessárias."""
    dependencies = ['mysql-connector-python', 'python-dotenv', 'bcrypt']
    
    print("📦 Verificando dependências Python...")
    
    for package in dependencies:
        try:
            __import__(package.replace('-', '_').split('>=')[0])
            print(f"   ✓ {package} já instalado")
        except ImportError:
            print(f"   → Instalando {package}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', package, '-q'])
            print(f"   ✓ {package} instalado com sucesso")
    
    print()

# Instalar dependências antes de importar
install_dependencies()

# Agora podemos importar as bibliotecas
import mysql.connector
from mysql.connector import Error
import bcrypt

# =============================================================================
# Configurações padrão
# =============================================================================

DEFAULT_CONFIG = {
    'host': '127.0.0.1',
    'port': 3306,
    'user': 'root',
    'password': 'Evolvetechsolutions123@',
    'database': 'eletrostart_db'
}

# Admin padrão
DEFAULT_ADMIN = {
    'email': 'admin@eletrostart.com.br',
    'password': 'Admin@123',
    'name': 'Administrador'
}

# =============================================================================
# SQL para criação das tabelas
# =============================================================================

CREATE_TABLES_SQL = """
-- =====================================================
-- Tabelas do Sistema de Mensagens de Contato
-- =====================================================

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

-- =====================================================
-- Tabelas do E-commerce
-- =====================================================

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

-- =====================================================
-- Índices para performance
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_contact_messages_status ON contact_messages(status);
CREATE INDEX IF NOT EXISTS idx_contact_messages_createdAt ON contact_messages(createdAt);
CREATE INDEX IF NOT EXISTS idx_products_categoryId ON products(categoryId);
CREATE INDEX IF NOT EXISTS idx_products_active ON products(active);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_createdAt ON orders(createdAt);
CREATE INDEX IF NOT EXISTS idx_order_items_orderId ON order_items(orderId);
"""

# =============================================================================
# Funções principais
# =============================================================================

def check_mysql_running(config):
    """Verifica se o MySQL Server está rodando."""
    print("🔍 Verificando conexão com MySQL Server...")
    
    try:
        connection = mysql.connector.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password']
        )
        
        if connection.is_connected():
            db_info = connection.get_server_info()
            print(f"   ✓ MySQL Server versão {db_info} está rodando")
            connection.close()
            return True
            
    except Error as e:
        print(f"   ✗ Erro ao conectar ao MySQL: {e}")
        print("\n💡 Dicas:")
        print("   1. Verifique se o MySQL Server está instalado e rodando")
        print("   2. Confira as credenciais (host, porta, usuário, senha)")
        print("   3. No Windows: Serviços -> MySQL -> Iniciar")
        return False

def get_user_config():
    """Retorna configurações padrão para automação."""
    print("\n⚙️  Usando configuração padrão (Automático)")
    print("-" * 50)
    
    config = DEFAULT_CONFIG.copy()
    print(f"   Host: {config['host']}")
    print(f"   Bando: {config['database']}")
    
    return config

def create_database(config):
    """Cria o banco de dados se não existir."""
    print(f"📂 Criando banco de dados '{config['database']}'...")
    
    try:
        connection = mysql.connector.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password']
        )
        
        cursor = connection.cursor()
        
        # Criar banco de dados
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {config['database']} "
                      f"CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci")
        
        print(f"   ✓ Banco de dados '{config['database']}' criado/verificado")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"   ✗ Erro ao criar banco de dados: {e}")
        return False

def create_tables(config):
    """Cria todas as tabelas necessárias."""
    print("📋 Criando tabelas...")
    
    try:
        connection = mysql.connector.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database'],
            autocommit=True
        )
        
        cursor = connection.cursor()
        
        # Executar cada statement separadamente
        statements = CREATE_TABLES_SQL.split(';')
        tables_created = 0
        
        for statement in statements:
            statement = statement.strip()
            if statement and not statement.startswith('--'):
                try:
                    cursor.execute(statement)
                    if 'CREATE TABLE' in statement.upper():
                        tables_created += 1
                except Error as e:
                    # Ignorar erros de índice duplicado
                    if 'Duplicate key name' not in str(e):
                        print(f"   ⚠ Aviso: {e}")
        
        connection.commit()
        
        # Listar tabelas criadas
        cursor.execute("SHOW TABLES")
        tables = cursor.fetchall()
        
        print(f"   ✓ {len(tables)} tabelas criadas/verificadas:")
        for table in tables:
            print(f"      • {table[0]}")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"   ✗ Erro ao criar tabelas: {e}")
        return False

def create_admin_user(config):
    """Cria o usuário admin padrão."""
    print("\n👤 Criando usuário admin padrão...")
    create = 's'
    
    if create == 'n':
        print("   → Admin não criado")
        return True
    
    try:
        connection = mysql.connector.connect(
            host=config['host'],
            port=config['port'],
            user=config['user'],
            password=config['password'],
            database=config['database']
        )
        
        cursor = connection.cursor()
        
        # Verificar se já existe
        cursor.execute("SELECT id FROM admin_users WHERE email = %s", 
                      (DEFAULT_ADMIN['email'],))
        
        if cursor.fetchone():
            print(f"   ℹ Admin já existe: {DEFAULT_ADMIN['email']}")
        else:
            # Gerar hash da senha
            password_hash = bcrypt.hashpw(
                DEFAULT_ADMIN['password'].encode('utf-8'), 
                bcrypt.gensalt(rounds=12)
            ).decode('utf-8')
            
            # Inserir admin
            admin_id = str(uuid.uuid4())
            cursor.execute("""
                INSERT INTO admin_users (id, email, password, name, role, active)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (admin_id, DEFAULT_ADMIN['email'], password_hash, 
                  DEFAULT_ADMIN['name'], 'ADMIN', 1))
            
            connection.commit()
            print(f"   ✓ Admin criado: {DEFAULT_ADMIN['email']}")
        
        cursor.close()
        connection.close()
        return True
        
    except Error as e:
        print(f"   ✗ Erro ao criar admin: {e}")
        return False

def update_env_file(config):
    """Atualiza o arquivo .env com as credenciais MySQL."""
    print("\n📝 Atualizando arquivo .env...")
    
    # Caminho do .env do servidor
    script_dir = os.path.dirname(os.path.abspath(__file__))
    env_path = os.path.join(script_dir, 'server', '.env')
    
    if not os.path.exists(env_path):
        print(f"   ⚠ Arquivo não encontrado: {env_path}")
        print("   → Criando novo arquivo .env...")
        
        # Se não existir, criar
        os.makedirs(os.path.dirname(env_path), exist_ok=True)
    
    # Ler conteúdo existente
    content = ""
    if os.path.exists(env_path):
        with open(env_path, 'r', encoding='utf-8') as f:
            content = f.read()
    
    # Nova URL do MySQL
    encoded_password = urllib.parse.quote_plus(config['password'])
    mysql_url = (f"mysql://{config['user']}:{encoded_password}@"
                f"{config['host']}:{config['port']}/{config['database']}")
    
    # Atualizar ou adicionar DATABASE_URL
    if 'DATABASE_URL=' in content:
        lines = content.split('\n')
        new_lines = []
        for line in lines:
            if line.startswith('DATABASE_URL='):
                new_lines.append(f'DATABASE_URL="{mysql_url}"')
            else:
                new_lines.append(line)
        content = '\n'.join(new_lines)
    else:
        content += f'\nDATABASE_URL="{mysql_url}"\n'
    
    # Salvar
    with open(env_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"   ✓ DATABASE_URL atualizado em: {env_path}")
    print(f"   → {mysql_url[:50]}...")
    
    return True

def print_next_steps(config):
    """Exibe os próximos passos."""
    print("\n" + "=" * 60)
    print("🎉 SETUP CONCLUÍDO COM SUCESSO!")
    print("=" * 60)
    
    print("\n📋 Próximos passos:")
    print()
    print("   1. Atualizar o Prisma para usar MySQL:")
    print("      ─────────────────────────────────────")
    print("      Edite server/prisma/schema.prisma:")
    print("      ")
    print('      datasource db {')
    print('        provider = "mysql"')
    print('        url      = env("DATABASE_URL")')
    print('      }')
    print()
    print("   2. Regenerar o Prisma Client:")
    print("      ─────────────────────────────────────")
    print("      cd server")
    print("      npx prisma generate")
    print()
    print("   3. Iniciar o servidor:")
    print("      ─────────────────────────────────────")
    print("      npm run dev")
    print()
    print("   4. Verificar no MySQL (opcional):")
    print("      ─────────────────────────────────────")
    print(f"      USE {config['database']};")
    print("      SHOW TABLES;")
    print("      SELECT * FROM admin_users;")
    print()

# =============================================================================
# Main
# =============================================================================

def main():
    print()
    print("╔════════════════════════════════════════════════════════════╗")
    print("║          ELETROSTART - MySQL Database Setup                ║")
    print("║                                                            ║")
    print("║   Este script configura o banco de dados MySQL para       ║")
    print("║   o projeto Eletrostart automaticamente.                   ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    
    # 1. Obter configurações do usuário
    config = get_user_config()
    
    # 2. Verificar se MySQL está rodando
    if not check_mysql_running(config):
        print("\n❌ Não foi possível conectar ao MySQL. Verifique as configurações.")
        sys.exit(1)
    
    # 3. Criar banco de dados
    if not create_database(config):
        print("\n❌ Falha ao criar banco de dados.")
        sys.exit(1)
    
    # 4. Criar tabelas
    if not create_tables(config):
        print("\n❌ Falha ao criar tabelas.")
        sys.exit(1)
    
    # 5. Criar admin padrão (opcional)
    create_admin_user(config)
    
    # 6. Atualizar .env
    update_env_file(config)
    
    # 7. Exibir próximos passos
    print_next_steps(config)

if __name__ == '__main__':
    main()
