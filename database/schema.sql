-- ============================================================
-- SISTEMA DE GERENCIAMENTO DE PRODUTOS
-- Script de Criação do Banco de Dados MySQL
-- ============================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS decorator_products 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE decorator_products;

-- ============================================================
-- TABELA DE CATEGORIAS
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Inserir categorias padrão
INSERT INTO categories (name, display_name, description, icon) VALUES
('eletronicos', 'Eletrônicos', 'Produtos eletrônicos como smartphones, notebooks, tablets', 'fas fa-laptop'),
('livros', 'Livros', 'Livros de diversos gêneros e categorias', 'fas fa-book'),
('alimentos', 'Alimentos', 'Produtos alimentícios e bebidas', 'fas fa-apple-alt')
ON DUPLICATE KEY UPDATE 
    display_name = VALUES(display_name),
    description = VALUES(description),
    icon = VALUES(icon);

-- ============================================================
-- TABELA DE PRODUTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    category_id INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL CHECK (price > 0),
    description TEXT,
    image_url VARCHAR(500),
    sku VARCHAR(100) UNIQUE,
    stock_quantity INT DEFAULT 0 CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_product_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE RESTRICT ON UPDATE CASCADE,
    
    INDEX idx_product_name (name),
    INDEX idx_product_category (category_id),
    INDEX idx_product_price (price),
    INDEX idx_product_active (is_active)
);

-- ============================================================
-- TABELA DE DESCONTOS
-- ============================================================
CREATE TABLE IF NOT EXISTS discounts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('category', 'coupon', 'product') NOT NULL,
    category_id INT NULL,
    product_id INT NULL,
    percentage DECIMAL(5, 2) NOT NULL CHECK (percentage > 0 AND percentage <= 100),
    fixed_amount DECIMAL(10, 2) DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date TIMESTAMP NULL,
    end_date TIMESTAMP NULL,
    usage_limit INT DEFAULT NULL,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_discount_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    CONSTRAINT fk_discount_product 
        FOREIGN KEY (product_id) REFERENCES products(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_discount_type (type),
    INDEX idx_discount_active (is_active),
    INDEX idx_discount_dates (start_date, end_date)
);

-- ============================================================
-- TABELA DE HISTÓRICO DE PREÇOS
-- ============================================================
CREATE TABLE IF NOT EXISTS price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    old_price DECIMAL(10, 2) NOT NULL,
    new_price DECIMAL(10, 2) NOT NULL,
    change_reason VARCHAR(255),
    changed_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT fk_price_history_product 
        FOREIGN KEY (product_id) REFERENCES products(id) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    
    INDEX idx_price_history_product (product_id),
    INDEX idx_price_history_date (created_at)
);

-- ============================================================
-- VIEWS PARA CONSULTAS OTIMIZADAS
-- ============================================================

-- View de produtos com informações de categoria
CREATE OR REPLACE VIEW v_products_with_category AS
SELECT 
    p.id,
    p.name,
    p.price,
    p.description,
    p.image_url,
    p.sku,
    p.stock_quantity,
    p.is_active,
    p.created_at,
    p.updated_at,
    c.name as category_name,
    c.display_name as category_display_name,
    c.icon as category_icon
FROM products p
INNER JOIN categories c ON p.category_id = c.id;

-- View de descontos ativos
CREATE OR REPLACE VIEW v_active_discounts AS
SELECT 
    d.id,
    d.name,
    d.type,
    d.percentage,
    d.fixed_amount,
    d.start_date,
    d.end_date,
    d.usage_limit,
    d.usage_count,
    c.name as category_name,
    c.display_name as category_display_name,
    p.name as product_name
FROM discounts d
LEFT JOIN categories c ON d.category_id = c.id
LEFT JOIN products p ON d.product_id = p.id
WHERE d.is_active = TRUE
AND (d.start_date IS NULL OR d.start_date <= NOW())
AND (d.end_date IS NULL OR d.end_date >= NOW())
AND (d.usage_limit IS NULL OR d.usage_count < d.usage_limit);

-- ============================================================
-- STORED PROCEDURES
-- ============================================================

DELIMITER //

-- Procedure para aplicar desconto em produto
CREATE OR REPLACE PROCEDURE sp_apply_discount_to_product(
    IN p_product_id INT,
    IN p_discount_id INT,
    OUT p_original_price DECIMAL(10,2),
    OUT p_final_price DECIMAL(10,2),
    OUT p_discount_amount DECIMAL(10,2)
)
BEGIN
    DECLARE v_price DECIMAL(10,2);
    DECLARE v_percentage DECIMAL(5,2);
    DECLARE v_fixed_amount DECIMAL(10,2);
    
    -- Buscar preço do produto
    SELECT price INTO v_price FROM products WHERE id = p_product_id;
    
    -- Buscar informações do desconto
    SELECT percentage, fixed_amount 
    INTO v_percentage, v_fixed_amount 
    FROM discounts 
    WHERE id = p_discount_id AND is_active = TRUE;
    
    -- Calcular valores
    SET p_original_price = v_price;
    
    IF v_percentage > 0 THEN
        SET p_discount_amount = v_price * (v_percentage / 100);
    ELSE
        SET p_discount_amount = v_fixed_amount;
    END IF;
    
    SET p_final_price = v_price - p_discount_amount;
    
    -- Garantir que o preço final não seja negativo
    IF p_final_price < 0 THEN
        SET p_final_price = 0;
        SET p_discount_amount = v_price;
    END IF;
END //

-- Procedure para calcular estatísticas de produtos
CREATE OR REPLACE PROCEDURE sp_get_product_statistics(
    OUT p_total_products INT,
    OUT p_average_price DECIMAL(10,2),
    OUT p_most_expensive_product VARCHAR(255),
    OUT p_cheapest_product VARCHAR(255),
    OUT p_total_categories INT
)
BEGIN
    -- Total de produtos
    SELECT COUNT(*) INTO p_total_products FROM products WHERE is_active = TRUE;
    
    -- Preço médio
    SELECT AVG(price) INTO p_average_price FROM products WHERE is_active = TRUE;
    
    -- Produto mais caro
    SELECT name INTO p_most_expensive_product 
    FROM products 
    WHERE is_active = TRUE 
    ORDER BY price DESC 
    LIMIT 1;
    
    -- Produto mais barato
    SELECT name INTO p_cheapest_product 
    FROM products 
    WHERE is_active = TRUE 
    ORDER BY price ASC 
    LIMIT 1;
    
    -- Total de categorias
    SELECT COUNT(DISTINCT category_id) INTO p_total_categories 
    FROM products 
    WHERE is_active = TRUE;
END //

DELIMITER ;

-- ============================================================
-- TRIGGERS
-- ============================================================

DELIMITER //

-- Trigger para registrar histórico de mudanças de preço
CREATE OR REPLACE TRIGGER tr_product_price_history
AFTER UPDATE ON products
FOR EACH ROW
BEGIN
    IF OLD.price != NEW.price THEN
        INSERT INTO price_history (product_id, old_price, new_price, change_reason, changed_by)
        VALUES (NEW.id, OLD.price, NEW.price, 'Atualização manual', USER());
    END IF;
END //

-- Trigger para atualizar contador de uso de desconto
CREATE OR REPLACE TRIGGER tr_discount_usage_increment
AFTER INSERT ON discounts
FOR EACH ROW
BEGIN
    -- Lógica para incrementar usage_count quando necessário
    -- (será implementada conforme necessidade específica)
    SET @dummy = 0;
END //

DELIMITER ;

-- ============================================================
-- INSERÇÃO DE DADOS DE EXEMPLO
-- ============================================================

-- Produtos de exemplo
INSERT INTO products (name, category_id, price, description, sku, stock_quantity) VALUES
('iPhone 15 Pro', 1, 7999.99, 'Smartphone Apple iPhone 15 Pro 256GB', 'IPH15P-256', 50),
('Samsung Galaxy S24', 1, 4999.99, 'Smartphone Samsung Galaxy S24 128GB', 'SGS24-128', 30),
('MacBook Air M2', 1, 8999.99, 'Notebook Apple MacBook Air M2 256GB', 'MBA-M2-256', 20),
('Dell Inspiron 15', 1, 2999.99, 'Notebook Dell Inspiron 15 512GB SSD', 'DELL-I15-512', 25),

('O Hobbit', 2, 35.90, 'Livro O Hobbit - J.R.R. Tolkien', 'LIV-HOBBIT', 100),
('Clean Code', 2, 89.99, 'Livro Clean Code - Robert C. Martin', 'LIV-CLEAN-CODE', 75),
('Design Patterns', 2, 149.99, 'Livro Design Patterns - Gang of Four', 'LIV-PATTERNS', 40),
('JavaScript: The Good Parts', 2, 79.99, 'Livro JavaScript: The Good Parts', 'LIV-JS-GOOD', 60),

('Arroz Integral 1kg', 3, 8.50, 'Arroz integral orgânico 1kg', 'ALI-ARROZ-1KG', 200),
('Azeite Extra Virgem 500ml', 3, 25.90, 'Azeite de oliva extra virgem 500ml', 'ALI-AZEITE-500', 150),
('Café Premium 250g', 3, 18.90, 'Café premium torrado e moído 250g', 'ALI-CAFE-250', 120),
('Mel Puro 300g', 3, 32.50, 'Mel puro de flores silvestres 300g', 'ALI-MEL-300', 80)
ON DUPLICATE KEY UPDATE 
    price = VALUES(price),
    description = VALUES(description),
    stock_quantity = VALUES(stock_quantity);

-- Descontos de exemplo
INSERT INTO discounts (name, type, category_id, percentage, is_active, start_date, end_date) VALUES
('Desconto Eletrônicos', 'category', 1, 10.00, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY)),
('Promoção Livros', 'category', 2, 15.00, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 15 DAY)),
('Cupom Geral', 'coupon', NULL, 5.00, TRUE, NOW(), DATE_ADD(NOW(), INTERVAL 7 DAY))
ON DUPLICATE KEY UPDATE 
    percentage = VALUES(percentage),
    is_active = VALUES(is_active);

-- ============================================================
-- USUÁRIO PARA APLICAÇÃO
-- ============================================================

-- Criar usuário específico para a aplicação (opcional)
-- CREATE USER IF NOT EXISTS 'decorator_app'@'localhost' IDENTIFIED BY 'decorator_2024!';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON decorator_products.* TO 'decorator_app'@'localhost';
-- FLUSH PRIVILEGES;

-- ============================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- ============================================================

-- Índice composto para busca por categoria e preço
CREATE INDEX idx_products_category_price ON products(category_id, price);

-- Índice para busca por nome (otimizado para LIKE)
CREATE INDEX idx_products_name_search ON products(name(50));

-- Índice para consultas de desconto por data
CREATE INDEX idx_discounts_active_dates ON discounts(is_active, start_date, end_date);

-- ============================================================
-- VIEWS DE RELATÓRIOS
-- ============================================================

-- Relatório de produtos por categoria
CREATE OR REPLACE VIEW v_products_by_category AS
SELECT 
    c.display_name as categoria,
    COUNT(p.id) as total_produtos,
    AVG(p.price) as preco_medio,
    MIN(p.price) as menor_preco,
    MAX(p.price) as maior_preco,
    SUM(p.stock_quantity) as estoque_total
FROM categories c
LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
GROUP BY c.id, c.display_name
ORDER BY total_produtos DESC;

-- Relatório de descontos aplicados
CREATE OR REPLACE VIEW v_discount_summary AS
SELECT 
    d.name as desconto,
    d.type as tipo,
    CASE 
        WHEN d.type = 'category' THEN c.display_name
        WHEN d.type = 'product' THEN p.name
        ELSE 'Todos os produtos'
    END as aplicado_em,
    d.percentage as percentual,
    d.usage_count as vezes_usado,
    d.start_date as inicio,
    d.end_date as fim
FROM discounts d
LEFT JOIN categories c ON d.category_id = c.id
LEFT JOIN products p ON d.product_id = p.id
WHERE d.is_active = TRUE
ORDER BY d.created_at DESC;

-- ============================================================
-- FINALIZAÇÃO
-- ============================================================

-- Verificar se todas as tabelas foram criadas
SELECT 
    TABLE_NAME as 'Tabelas Criadas',
    TABLE_ROWS as 'Registros',
    CREATE_TIME as 'Data Criação'
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'decorator_products'
ORDER BY TABLE_NAME;

-- Mostrar estatísticas iniciais
SELECT 
    (SELECT COUNT(*) FROM products) as total_produtos,
    (SELECT COUNT(*) FROM categories) as total_categorias,
    (SELECT COUNT(*) FROM discounts) as total_descontos;

COMMIT;