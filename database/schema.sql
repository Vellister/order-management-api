-- Criação do banco de dados
CREATE DATABASE order_management;

-- Conectar ao banco
\c order_management;

-- Tabela de Usuáros 
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Pedidos
CREATE TABLE orders (
    order_id VARCHAR(100) PRIMARY KEY,
    value DECIMAL(10, 2) NOT NULL,
    creation_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Itens
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(100) NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- Índices para melhorar performance
CREATE INDEX idx_items_order_id ON items(order_id);
CREATE INDEX idx_orders_creation_date ON orders(creation_date);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir usuário de teste 
INSERT INTO users (username, email, password) 
VALUES (
    'admin', 
    'admin@example.com', 
    '$2a$10$X8qJ9Z0vZqYxH7Kp8rJ0qO8YqH7Kp8rJ0qO8YqH7Kp8rJ0qO8Yq'
);

-- Comentários nas tabelas
COMMENT ON TABLE orders IS 'Tabela principal de pedidos';
COMMENT ON TABLE items IS 'Tabela de itens dos pedidos';
COMMENT ON TABLE users IS 'Tabela de usuários para autenticação';