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