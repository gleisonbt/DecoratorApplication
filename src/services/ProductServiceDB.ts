const { db } = require('../database/connection.js');
const ProductRepository = require('../database/ProductRepository.js');
import { Product } from '../models/Product';
import { Category } from '../models/Category';

/**
 * Serviço para gerenciamento de produtos com integração MySQL
 * Implementa a camada de serviço/modelo do padrão MVC
 * Agora usa banco de dados para persistência
 */
export class ProductService {
    private productRepository: any;

    constructor() {
        this.productRepository = new ProductRepository();
    }

    /**
     * Adiciona um novo produto no banco de dados
     */
    async addProduct(product: Product): Promise<{ success: boolean; message: string; id?: number }> {
        try {
            // Verificar se já existe um produto com o mesmo nome
            const existing = await this.productRepository.findByName(product.name);
            if (existing) {
                throw new Error(`Produto com nome "${product.name}" já existe`);
            }

            const productData = {
                name: product.name,
                category: product.category,
                price: product.price,
                description: `Produto ${product.name} da categoria ${product.category}`,
                stock_quantity: 100 // Valor padrão
            };

            const result = await this.productRepository.create(productData);
            
            if (result.success) {
                return {
                    success: true,
                    message: `Produto "${product.name}" adicionado com sucesso!`,
                    id: result.insertId
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Remove um produto do banco de dados
     */
    async removeProduct(name: string): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.productRepository.deleteByName(name);
            
            if (result.success && result.affectedRows > 0) {
                return {
                    success: true,
                    message: `Produto "${name}" removido com sucesso!`
                };
            } else if (result.affectedRows === 0) {
                throw new Error(`Produto "${name}" não encontrado`);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Busca um produto pelo nome
     */
    async findProductByName(name: string): Promise<Product | undefined> {
        try {
            const result = await this.productRepository.findByName(name);
            
            if (result) {
                return new Product(result.name, result.category as Category, parseFloat(result.price) || 0);
            }
            
            return undefined;
        } catch (error) {
            console.error('Erro ao buscar produto por nome:', error);
            return undefined;
        }
    }

    /**
     * Busca produtos por categoria
     */
    async getProductsByCategory(category: Category): Promise<Product[]> {
        try {
            const result = await this.productRepository.findByCategory(category);
            
            if (result.success) {
                return result.data.map((item: any) => 
                    new Product(item.name, item.category as Category, parseFloat(item.price) || 0)
                );
            }
            
            return [];
        } catch (error) {
            console.error('Erro ao buscar produtos por categoria:', error);
            return [];
        }
    }

    /**
     * Retorna todos os produtos do banco de dados
     */
    async getAllProducts(): Promise<Product[]> {
        try {
            const result = await this.productRepository.findAll();
            
            if (result.success) {
                return result.data.map((item: any) => 
                    new Product(item.name, item.category as Category, parseFloat(item.price) || 0)
                );
            }
            
            return [];
        } catch (error) {
            console.error('Erro ao buscar todos os produtos:', error);
            return [];
        }
    }

    /**
     * Atualiza um produto existente
     */
    async updateProduct(name: string, updates: Partial<Omit<Product, 'name'>>): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.productRepository.update(
                await this.getProductIdByName(name),
                updates
            );
            
            if (result.success && result.affectedRows > 0) {
                return {
                    success: true,
                    message: `Produto "${name}" atualizado com sucesso!`
                };
            } else if (result.affectedRows === 0) {
                throw new Error(`Produto "${name}" não encontrado`);
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Busca produtos por faixa de preço
     */
    async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
        try {
            const result = await this.productRepository.findByPriceRange(minPrice, maxPrice);
            
            if (result.success) {
                return result.data.map((item: any) => 
                    new Product(item.name, item.category as Category, item.price)
                );
            }
            
            return [];
        } catch (error) {
            console.error('Erro ao buscar produtos por faixa de preço:', error);
            return [];
        }
    }

    /**
     * Busca produtos por termo de pesquisa
     */
    async searchProducts(searchTerm: string): Promise<Product[]> {
        try {
            const result = await this.productRepository.search(searchTerm);
            
            if (result.success) {
                return result.data.map((item: any) => 
                    new Product(item.name, item.category as Category, parseFloat(item.price) || 0)
                );
            }
            
            return [];
        } catch (error) {
            console.error('Erro ao pesquisar produtos:', error);
            return [];
        }
    }

    /**
     * Obtém estatísticas dos produtos
     */
    async getProductStatistics(): Promise<{
        total: number;
        averagePrice: number;
        mostExpensive: string | null;
        cheapest: string | null;
        byCategory: { [key: string]: number };
    }> {
        try {
            const [statsResult, categoryResult] = await Promise.all([
                this.productRepository.getStatistics(),
                this.productRepository.getProductsByCategory()
            ]);

            const stats = {
                total: 0,
                averagePrice: 0,
                mostExpensive: null as string | null,
                cheapest: null as string | null,
                byCategory: {} as { [key: string]: number }
            };

            if (statsResult.success && statsResult.data.length > 0) {
                const data = statsResult.data[0];
                stats.total = data.total_products || 0;
                stats.averagePrice = parseFloat(data.average_price || 0);
                stats.mostExpensive = data.most_expensive;
                stats.cheapest = data.cheapest;
            }

            if (categoryResult.success) {
                categoryResult.data.forEach((item: any) => {
                    stats.byCategory[item.category] = item.product_count;
                });
            }

            return stats;
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return {
                total: 0,
                averagePrice: 0,
                mostExpensive: null,
                cheapest: null,
                byCategory: {}
            };
        }
    }

    /**
     * Limpa todos os produtos
     */
    async clearAllProducts(): Promise<{ success: boolean; message: string }> {
        try {
            const result = await this.productRepository.deleteAll();
            
            if (result.success) {
                return {
                    success: true,
                    message: 'Todos os produtos foram removidos!'
                };
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            return {
                success: false,
                message: error.message
            };
        }
    }

    /**
     * Verifica se um produto existe
     */
    async productExists(name: string): Promise<boolean> {
        try {
            return await this.productRepository.exists(name);
        } catch (error) {
            console.error('Erro ao verificar existência do produto:', error);
            return false;
        }
    }

    /**
     * Método auxiliar para obter ID do produto por nome
     */
    private async getProductIdByName(name: string): Promise<number> {
        const product = await this.productRepository.findByName(name);
        if (!product) {
            throw new Error(`Produto "${name}" não encontrado`);
        }
        return product.id;
    }

    /**
     * Testa a conexão com o banco de dados
     */
    async testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
        try {
            const result = await db.testConnection();
            return result;
        } catch (error: any) {
            return {
                success: false,
                message: `Erro ao conectar com banco: ${error.message}`
            };
        }
    }
}