const { db } = require('./connection.js');
const { Product } = require('../models/Product.ts');

/**
 * Repository para operações de produtos no banco de dados
 * Implementa o padrão Repository para abstrair acesso aos dados
 * SEMPRE retorna e recebe objetos Product Model
 */
class ProductRepository {
    
    /**
     * Converte dados do banco para objeto Product
     */
    _toProductModel(dbData) {
        if (!dbData) return null;
        return new Product(dbData);
    }

    /**
     * Converte array de dados do banco para array de objetos Product
     */
    _toProductModelArray(dbDataArray) {
        if (!Array.isArray(dbDataArray)) return [];
        return dbDataArray.map(data => this._toProductModel(data));
    }

    /**
     * Busca todos os produtos ativos
     * @returns {Promise<Product[]>} Array de objetos Product
     */
    async findAll() {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.description,
                p.image_url,
                p.sku,
                p.stock_quantity,
                p.created_at,
                p.updated_at,
                c.name as category,
                c.display_name as category_display_name,
                c.icon as category_icon
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE p.is_active = TRUE
            ORDER BY p.name ASC
        `;
        
        const result = await db.select(query);
        if (result.success) {
            return {
                success: true,
                data: this._toProductModelArray(result.data)
            };
        }
        return result;
    }

    /**
     * Busca produto por ID
     * @param {number} id - ID do produto
     * @returns {Promise<Product|null>} Objeto Product ou null
     */
    async findById(id) {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.description,
                p.image_url,
                p.sku,
                p.stock_quantity,
                p.created_at,
                p.updated_at,
                c.name as category,
                c.display_name as category_display_name,
                c.icon as category_icon
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE p.id = ? AND p.is_active = TRUE
        `;
        
        const result = await db.select(query, [id]);
        if (result.success && result.data.length > 0) {
            return this._toProductModel(result.data[0]);
        }
        return null;
    }

    /**
     * Busca produto por nome
     * @param {string} name - Nome do produto
     * @returns {Promise<Product|null>} Objeto Product ou null
     */
    async findByName(name) {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.description,
                p.image_url,
                p.sku,
                p.stock_quantity,
                p.created_at,
                p.updated_at,
                c.name as category,
                c.display_name as category_display_name,
                c.icon as category_icon
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE p.name = ? AND p.is_active = TRUE
        `;
        
        const result = await db.select(query, [name]);
        if (result.success && result.data.length > 0) {
            return this._toProductModel(result.data[0]);
        }
        return null;
    }

    /**
     * Busca produtos por categoria
     * @param {string} categoryName - Nome da categoria
     * @returns {Promise<Product[]>} Array de objetos Product
     */
    async findByCategory(categoryName) {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.description,
                p.image_url,
                p.sku,
                p.stock_quantity,
                p.created_at,
                p.updated_at,
                c.name as category,
                c.display_name as category_display_name,
                c.icon as category_icon
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE c.name = ? AND p.is_active = TRUE
            ORDER BY p.name ASC
        `;
        
        const result = await db.select(query, [categoryName]);
        if (result.success) {
            return {
                success: true,
                data: this._toProductModelArray(result.data)
            };
        }
        return result;
    }

    /**
     * Busca produtos por faixa de preço
     * @param {number} minPrice - Preço mínimo
     * @param {number} maxPrice - Preço máximo
     * @returns {Promise<Product[]>} Array de objetos Product
     */
    async findByPriceRange(minPrice, maxPrice) {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.description,
                p.image_url,
                p.sku,
                p.stock_quantity,
                p.created_at,
                p.updated_at,
                c.name as category,
                c.display_name as category_display_name,
                c.icon as category_icon
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE p.price BETWEEN ? AND ? AND p.is_active = TRUE
            ORDER BY p.price ASC
        `;
        
        const result = await db.select(query, [minPrice, maxPrice]);
        if (result.success) {
            return {
                success: true,
                data: this._toProductModelArray(result.data)
            };
        }
        return result;
    }

    /**
     * Busca produtos por termo (nome ou descrição)
     * @param {string} searchTerm - Termo de busca
     * @returns {Promise<Product[]>} Array de objetos Product
     */
    async search(searchTerm) {
        const query = `
            SELECT 
                p.id,
                p.name,
                p.price,
                p.description,
                p.image_url,
                p.sku,
                p.stock_quantity,
                p.created_at,
                p.updated_at,
                c.name as category,
                c.display_name as category_display_name,
                c.icon as category_icon
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE (p.name LIKE ? OR p.description LIKE ?) 
            AND p.is_active = TRUE
            ORDER BY p.name ASC
        `;
        
        const searchPattern = `%${searchTerm}%`;
        const result = await db.select(query, [searchPattern, searchPattern]);
        if (result.success) {
            return {
                success: true,
                data: this._toProductModelArray(result.data)
            };
        }
        return result;
    }

    /**
     * Cria um novo produto
     * @param {Product} product - Objeto Product a ser criado
     * @returns {Promise<Object>} Resultado da operação
     */
    async create(product) {
        if (!(product instanceof Product)) {
            return { success: false, error: 'Parâmetro deve ser um objeto Product' };
        }

        if (!product.isValid()) {
            return { success: false, error: 'Dados do produto inválidos' };
        }

        // Buscar o ID da categoria
        const categoryQuery = 'SELECT id FROM categories WHERE name = ?';
        const categoryResult = await db.select(categoryQuery, [product.category]);
        
        if (!categoryResult.success || categoryResult.data.length === 0) {
            return { success: false, error: 'Categoria não encontrada' };
        }
        
        const categoryId = categoryResult.data[0].id;
        
        const query = `
            INSERT INTO products (name, category_id, price, description, sku, stock_quantity)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        const params = [
            product.name,
            categoryId,
            product.price,
            product.description || null,
            product.sku || null,
            product.stock_quantity || 0
        ];
        
        return await db.insert(query, params);
    }

    /**
     * Atualiza um produto existente
     * @param {number} id - ID do produto a ser atualizado
     * @param {Product} product - Objeto Product com os novos dados
     * @returns {Promise<Object>} Resultado da operação
     */
    async update(id, product) {
        if (!(product instanceof Product)) {
            return { success: false, error: 'Parâmetro deve ser um objeto Product' };
        }

        if (!product.isValid()) {
            return { success: false, error: 'Dados do produto inválidos' };
        }

        // Buscar o ID da categoria
        const categoryQuery = 'SELECT id FROM categories WHERE name = ?';
        const categoryResult = await db.select(categoryQuery, [product.category]);
        
        if (!categoryResult.success || categoryResult.data.length === 0) {
            return { success: false, error: 'Categoria não encontrada' };
        }
        
        const categoryId = categoryResult.data[0].id;
        
        const query = `
            UPDATE products 
            SET name = ?, category_id = ?, price = ?, description = ?, sku = ?, stock_quantity = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND is_active = TRUE
        `;
        
        const params = [
            product.name,
            categoryId,
            product.price,
            product.description || null,
            product.sku || null,
            product.stock_quantity || 0,
            id
        ];
        
        return await db.update(query, params);
    }

    /**
     * Remove um produto (soft delete)
     */
    async delete(id) {
        const query = 'UPDATE products SET is_active = FALSE WHERE id = ?';
        return await db.update(query, [id]);
    }

    /**
     * Remove produto por nome
     */
    async deleteByName(name) {
        const query = 'UPDATE products SET is_active = FALSE WHERE name = ?';
        return await db.update(query, [name]);
    }

    /**
     * Obtém estatísticas dos produtos
     */
    async getStatistics() {
        try {
            // Estatísticas gerais
            const generalQuery = `
                SELECT 
                    COUNT(*) as totalProducts,
                    AVG(price) as averagePrice,
                    MIN(price) as minPrice,
                    MAX(price) as maxPrice,
                    (SELECT name FROM products WHERE price = (SELECT MAX(price) FROM products WHERE is_active = TRUE) AND is_active = TRUE LIMIT 1) as mostExpensiveProduct,
                    (SELECT name FROM products WHERE price = (SELECT MIN(price) FROM products WHERE is_active = TRUE) AND is_active = TRUE LIMIT 1) as cheapestProduct
                FROM products 
                WHERE is_active = TRUE
            `;
            
            const generalResult = await db.select(generalQuery);
            
            // Estatísticas por categoria
            const categoryQuery = `
                SELECT 
                    c.name as category,
                    COUNT(p.id) as count
                FROM categories c
                LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
                GROUP BY c.id, c.name
                HAVING COUNT(p.id) > 0
                ORDER BY count DESC
            `;
            
            const categoryResult = await db.select(categoryQuery);
            
            if (generalResult.success && categoryResult.success) {
                const general = generalResult.data[0];
                const categories = {};
                
                categoryResult.data.forEach(row => {
                    categories[row.category] = row.count;
                });
                
                return {
                    success: true,
                    data: {
                        totalProducts: general.totalProducts,
                        averagePrice: parseFloat(general.averagePrice) || 0,
                        minPrice: general.minPrice,
                        maxPrice: general.maxPrice,
                        mostExpensiveProduct: general.mostExpensiveProduct,
                        cheapestProduct: general.cheapestProduct,
                        productsByCategory: categories
                    }
                };
            } else {
                throw new Error('Erro ao buscar estatísticas');
            }
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Obtém contagem de produtos por categoria
     */
    async getProductsByCategory() {
        const query = `
            SELECT 
                c.name as category,
                c.display_name as category_display_name,
                COUNT(p.id) as product_count
            FROM categories c
            LEFT JOIN products p ON c.id = p.category_id AND p.is_active = TRUE
            GROUP BY c.id, c.name, c.display_name
            ORDER BY product_count DESC
        `;
        
        return await db.select(query);
    }

    /**
     * Busca ID da categoria pelo nome
     */
    async getCategoryId(categoryName) {
        const query = 'SELECT id FROM categories WHERE name = ?';
        const result = await db.select(query, [categoryName]);
        
        if (result.success && result.data.length > 0) {
            return result.data[0].id;
        }
        
        return null;
    }

    /**
     * Limpa todos os produtos (soft delete)
     */
    async deleteAll() {
        const query = 'UPDATE products SET is_active = FALSE';
        return await db.update(query);
    }

    /**
     * Verifica se produto existe
     */
    async exists(name) {
        const query = 'SELECT COUNT(*) as count FROM products WHERE name = ? AND is_active = TRUE';
        const result = await db.select(query, [name]);
        return result.success && result.data[0].count > 0;
    }
}

module.exports = { ProductRepository };