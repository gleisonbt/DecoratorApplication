const express = require('express');
const path = require('path');

// Importar componentes do banco de dados
const { ProductRepository } = require('./src/database/ProductRepository');
const { DatabaseManager } = require('./src/database/connection');
const { Product } = require('./src/models/Product.ts');

const app = express();
const PORT = process.env.PORT || 3000;

// Inicializar repositório de produtos
const productRepository = new ProductRepository();

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para JSON
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// === ENDPOINTS DA API ===

// Status da aplicação
app.get('/api/status', async (req, res) => {
    try {
        // Testar conexão com banco
        const dbManager = new DatabaseManager();
        const testResult = await dbManager.testConnection();
        
        res.json({
            status: 'active',
            message: 'Sistema de Gerenciamento de Produtos está funcionando',
            timestamp: new Date().toISOString(),
            version: '1.0.0',
            database: testResult.success ? 'connected' : 'disconnected'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Erro ao verificar status',
            error: error.message
        });
    }
});

// Listar todos os produtos
app.get('/api/products', async (req, res) => {
    try {
        const result = await productRepository.findAll();
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                count: result.data.length
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar produtos',
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Buscar produtos por categoria
app.get('/api/products/category/:category', async (req, res) => {
    try {
        const category = req.params.category;
        const result = await productRepository.findByCategory(category);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                count: result.data.length,
                category: category
            });
        } else {
            res.status(500).json({
                success: false,
                message: `Erro ao buscar produtos da categoria ${category}`,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Buscar produto por nome
app.get('/api/products/search/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const result = await productRepository.search(name);
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                count: result.data.length,
                searchTerm: name
            });
        } else {
            res.status(500).json({
                success: false,
                message: `Erro ao buscar produtos com nome "${name}"`,
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Adicionar novo produto
app.post('/api/products', async (req, res) => {
    try {
        const { name, category, price, description, sku, stock_quantity } = req.body;
        
        // Criar objeto Product
        const product = new Product({
            name,
            category,
            price: parseFloat(price),
            description: description || '',
            sku: sku || `SKU-${Date.now()}`,
            stock_quantity: stock_quantity || 0
        });

        // Validar produto
        if (!product.isValid()) {
            return res.status(400).json({
                success: false,
                message: 'Dados do produto inválidos. Verifique nome, categoria e preço.'
            });
        }

        const result = await productRepository.create(product);
        
        if (result.success) {
            res.status(201).json({
                success: true,
                message: `Produto "${name}" adicionado com sucesso!`,
                data: {
                    id: result.insertId,
                    ...product.toJSON()
                }
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao adicionar produto',
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Remover produto
app.delete('/api/products/:name', async (req, res) => {
    try {
        const name = req.params.name;
        const result = await productRepository.deleteByName(name);
        
        if (result.success && result.affectedRows > 0) {
            res.json({
                success: true,
                message: `Produto "${name}" removido com sucesso!`
            });
        } else if (result.affectedRows === 0) {
            res.status(404).json({
                success: false,
                message: `Produto "${name}" não encontrado`
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao remover produto',
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Estatísticas dos produtos
app.get('/api/products/stats', async (req, res) => {
    try {
        const result = await productRepository.getStatistics();
        
        if (result.success) {
            res.json({
                success: true,
                data: result.data
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar estatísticas',
                error: result.error
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// === ROTAS DE FILTROS COM PADRÃO DECORATOR ===

// Filtrar produtos com múltiplos parâmetros
app.get('/api/products/filter', async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            inStockOnly,
            limit,
            offset
        } = req.query;

        // Converter parâmetros para tipos corretos
        const filterParams = {
            category: category || undefined,
            search: search || undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            inStockOnly: inStockOnly === 'true',
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
        };

        // Aplicar filtros usando padrão Decorator
        const result = await applyProductFilters(filterParams);
        
        if (result.success) {
            res.json(result);
        } else {
            res.status(500).json(result);
        }
    } catch (error) {
        console.error('Erro na rota de filtros:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Obter categorias disponíveis
app.get('/api/categories', async (req, res) => {
    try {
        const products = await productRepository.findAll();
        
        if (products.success) {
            const categories = [...new Set(products.data.map(p => p.category))];
            res.json({
                success: true,
                data: categories.sort()
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao buscar categorias'
            });
        }
    } catch (error) {
        console.error('Erro ao buscar categorias:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// Estatísticas de produtos filtrados
app.get('/api/products/stats', async (req, res) => {
    try {
        const {
            category,
            search,
            minPrice,
            maxPrice,
            inStockOnly
        } = req.query;

        const filterParams = {
            category: category || undefined,
            search: search || undefined,
            minPrice: minPrice ? parseFloat(minPrice) : undefined,
            maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
            inStockOnly: inStockOnly === 'true'
        };

        const stats = await getFilteredStats(filterParams);
        
        if (stats.success) {
            res.json(stats);
        } else {
            res.status(500).json(stats);
        }
    } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor',
            error: error.message
        });
    }
});

// === FUNÇÕES DE FILTROS COM PADRÃO DECORATOR ===

/**
 * Interface básica para filtros usando padrão Decorator
 */
class ProductFilter {
    async filter(products) {
        throw new Error('Método filter deve ser implementado');
    }
    
    getDescription() {
        throw new Error('Método getDescription deve ser implementado');
    }
}

/**
 * Filtro base - não aplica filtragem
 */
class BaseFilter extends ProductFilter {
    async filter(products) {
        return [...products];
    }
    
    getDescription() {
        return 'Filtro base (sem filtragem)';
    }
}

/**
 * Decorator abstrato para filtros
 */
class FilterDecorator extends ProductFilter {
    constructor(filter) {
        super();
        this.baseFilter = filter;
    }
}

/**
 * Filtro por categoria
 */
class CategoryFilter extends FilterDecorator {
    constructor(filter, category) {
        super(filter);
        this.category = category;
    }
    
    async filter(products) {
        const baseFiltered = await this.baseFilter.filter(products);
        return baseFiltered.filter(product => 
            product.category.toLowerCase() === this.category.toLowerCase()
        );
    }
    
    getDescription() {
        const baseDesc = this.baseFilter.getDescription();
        const categoryDesc = `Categoria: ${this.category}`;
        return baseDesc === 'Filtro base (sem filtragem)' 
            ? categoryDesc 
            : `${baseDesc} + ${categoryDesc}`;
    }
}

/**
 * Filtro por busca textual
 */
class SearchFilter extends FilterDecorator {
    constructor(filter, searchTerm) {
        super(filter);
        this.searchTerm = searchTerm;
    }
    
    async filter(products) {
        const baseFiltered = await this.baseFilter.filter(products);
        const term = this.searchTerm.toLowerCase();
        return baseFiltered.filter(product => 
            product.name.toLowerCase().includes(term) ||
            (product.description && product.description.toLowerCase().includes(term))
        );
    }
    
    getDescription() {
        const baseDesc = this.baseFilter.getDescription();
        const searchDesc = `Busca: "${this.searchTerm}"`;
        return baseDesc === 'Filtro base (sem filtragem)' 
            ? searchDesc 
            : `${baseDesc} + ${searchDesc}`;
    }
}

/**
 * Filtro por faixa de preço
 */
class PriceRangeFilter extends FilterDecorator {
    constructor(filter, minPrice, maxPrice) {
        super(filter);
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }
    
    async filter(products) {
        const baseFiltered = await this.baseFilter.filter(products);
        return baseFiltered.filter(product => {
            const price = parseFloat(product.price);
            
            if (this.minPrice !== undefined && price < this.minPrice) {
                return false;
            }
            
            if (this.maxPrice !== undefined && price > this.maxPrice) {
                return false;
            }
            
            return true;
        });
    }
    
    getDescription() {
        const baseDesc = this.baseFilter.getDescription();
        let priceDesc = 'Preço: ';
        
        if (this.minPrice !== undefined && this.maxPrice !== undefined) {
            priceDesc += `R$ ${this.minPrice.toFixed(2)} - R$ ${this.maxPrice.toFixed(2)}`;
        } else if (this.minPrice !== undefined) {
            priceDesc += `>= R$ ${this.minPrice.toFixed(2)}`;
        } else if (this.maxPrice !== undefined) {
            priceDesc += `<= R$ ${this.maxPrice.toFixed(2)}`;
        }
        
        return baseDesc === 'Filtro base (sem filtragem)' 
            ? priceDesc 
            : `${baseDesc} + ${priceDesc}`;
    }
}

/**
 * Filtro por estoque
 */
class StockFilter extends FilterDecorator {
    constructor(filter, inStockOnly = true) {
        super(filter);
        this.inStockOnly = inStockOnly;
    }
    
    async filter(products) {
        const baseFiltered = await this.baseFilter.filter(products);
        
        if (!this.inStockOnly) {
            return baseFiltered;
        }
        
        return baseFiltered.filter(product => {
            const stock = parseInt(product.stock_quantity) || 0;
            return stock > 0;
        });
    }
    
    getDescription() {
        const baseDesc = this.baseFilter.getDescription();
        const stockDesc = this.inStockOnly ? 'Apenas em estoque' : 'Incluir sem estoque';
        return baseDesc === 'Filtro base (sem filtragem)' 
            ? stockDesc 
            : `${baseDesc} + ${stockDesc}`;
    }
}

/**
 * Factory para criar filtros compostos
 */
class FilterFactory {
    static createCompleteFilter(category, searchTerm, minPrice, maxPrice, inStockOnly) {
        let filter = new BaseFilter();
        
        if (category) {
            filter = new CategoryFilter(filter, category);
        }
        
        if (searchTerm?.trim()) {
            filter = new SearchFilter(filter, searchTerm);
        }
        
        if (minPrice !== undefined || maxPrice !== undefined) {
            filter = new PriceRangeFilter(filter, minPrice, maxPrice);
        }
        
        if (inStockOnly) {
            filter = new StockFilter(filter, true);
        }
        
        return filter;
    }
}

/**
 * Aplica filtros aos produtos usando padrão Decorator
 */
async function applyProductFilters(filterParams) {
    try {
        // Buscar todos os produtos
        const allProducts = await productRepository.findAll();
        
        if (!allProducts.success) {
            return {
                success: false,
                message: 'Erro ao buscar produtos do banco de dados'
            };
        }
        
        // Criar filtro composto
        const filter = FilterFactory.createCompleteFilter(
            filterParams.category,
            filterParams.search,
            filterParams.minPrice,
            filterParams.maxPrice,
            filterParams.inStockOnly
        );
        
        // Aplicar filtros
        const filteredProducts = await filter.filter(allProducts.data);
        
        // Log para debug
        console.log('🔍 Filtro aplicado:', filter.getDescription());
        console.log('📊 Produtos encontrados:', filteredProducts.length, 'de', allProducts.data.length);
        
        // Aplicar paginação se especificada
        let paginatedProducts = filteredProducts;
        if (filterParams.limit !== undefined) {
            const offset = filterParams.offset || 0;
            paginatedProducts = filteredProducts.slice(offset, offset + filterParams.limit);
        }
        
        return {
            success: true,
            data: paginatedProducts,
            total: filteredProducts.length,
            filtered: filteredProducts.length,
            original: allProducts.data.length,
            filter: filter.getDescription(),
            pagination: filterParams.limit ? {
                limit: filterParams.limit,
                offset: filterParams.offset || 0,
                hasNext: (filterParams.offset || 0) + filterParams.limit < filteredProducts.length
            } : null
        };
        
    } catch (error) {
        console.error('Erro ao aplicar filtros:', error);
        return {
            success: false,
            message: 'Erro interno do servidor ao filtrar produtos',
            error: error.message
        };
    }
}

/**
 * Calcula estatísticas dos produtos filtrados
 */
async function getFilteredStats(filterParams) {
    try {
        const result = await applyProductFilters(filterParams);
        
        if (!result.success) {
            return result;
        }
        
        const products = result.data;
        
        if (products.length === 0) {
            return {
                success: true,
                data: {
                    total: 0,
                    averagePrice: 0,
                    minPrice: 0,
                    maxPrice: 0,
                    totalValue: 0,
                    categoriesCount: 0,
                    inStockCount: 0,
                    outOfStockCount: 0
                }
            };
        }
        
        const prices = products.map(p => parseFloat(p.price));
        const totalValue = prices.reduce((sum, price) => sum + price, 0);
        const inStockProducts = products.filter(p => (parseInt(p.stock_quantity) || 0) > 0);
        
        return {
            success: true,
            data: {
                total: products.length,
                averagePrice: totalValue / products.length,
                minPrice: Math.min(...prices),
                maxPrice: Math.max(...prices),
                totalValue,
                categoriesCount: new Set(products.map(p => p.category)).size,
                inStockCount: inStockProducts.length,
                outOfStockCount: products.length - inStockProducts.length
            }
        };
        
    } catch (error) {
        console.error('Erro ao calcular estatísticas:', error);
        return {
            success: false,
            message: 'Erro ao calcular estatísticas'
        };
    }
}

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Algo deu errado!',
        message: err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Interface web disponível em http://localhost:${PORT}`);
    console.log(`🔧 Status da API: http://localhost:${PORT}/api/status`);
});

module.exports = app;