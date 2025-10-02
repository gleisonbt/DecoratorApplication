// Models
import { Product, Category, CategoryType } from '../models/Product';
import { PriceCalc } from '../models/PriceCalc';

// Services
import { ProductService } from '../services/ProductService';
import { BasicPrice, CategoryPercentOff, CouponPercentOff } from '../services/PriceCalculators';

/**
 * Controller para gerenciar produtos com integração MySQL
 * Implementa a camada de controle do padrão MVC
 * Agora suporta operações assíncronas com banco de dados
 */
export class ProductControllerDB {
    private productService: ProductService;
    private priceCalculator: PriceCalc;

    constructor() {
        this.productService = new ProductService();
        this.priceCalculator = new BasicPrice(); // Calculador padrão
    }

    /**
     * Adiciona um novo produto com validação e persistência
     */
    async addProduct(name: string, category: CategoryType, price: number): Promise<{ success: boolean; message: string; product?: Product }> {
        try {
            // Validações básicas
            if (!name || name.trim().length === 0) {
                return { success: false, message: 'Nome do produto é obrigatório' };
            }

            if (price <= 0) {
                return { success: false, message: 'Preço deve ser maior que zero' };
            }

            if (!Object.values(Category).includes(category as any)) {
                return { success: false, message: 'Categoria inválida' };
            }

            // Criar produto e adicionar ao banco
            const product = new Product({ name: name.trim(), category, price });
            const result = await this.productService.addProduct(product);

            if (result.success) {
                return { 
                    success: true, 
                    message: result.message, 
                    product 
                };
            } else {
                return { success: false, message: result.message };
            }
        } catch (error: any) {
            return { 
                success: false, 
                message: `Erro ao adicionar produto: ${error.message}` 
            };
        }
    }

    /**
     * Remove um produto
     */
    async removeProduct(name: string): Promise<{ success: boolean; message: string }> {
        try {
            if (!name || name.trim().length === 0) {
                return { success: false, message: 'Nome do produto é obrigatório' };
            }

            return await this.productService.removeProduct(name.trim());
        } catch (error: any) {
            return { 
                success: false, 
                message: `Erro ao remover produto: ${error.message}` 
            };
        }
    }

    /**
     * Busca todos os produtos
     */
    async getAllProducts(): Promise<Product[]> {
        try {
            return await this.productService.getAllProducts();
        } catch (error) {
            console.error('Erro ao buscar produtos:', error);
            return [];
        }
    }

    /**
     * Busca produtos por categoria
     */
    async getProductsByCategory(category: CategoryType): Promise<Product[]> {
        try {
            return await this.productService.getProductsByCategory(category);
        } catch (error) {
            console.error('Erro ao buscar produtos por categoria:', error);
            return [];
        }
    }

    /**
     * Busca produto por nome
     */
    async findProductByName(name: string): Promise<Product | undefined> {
        try {
            if (!name || name.trim().length === 0) {
                return undefined;
            }

            return await this.productService.findProductByName(name.trim());
        } catch (error) {
            console.error('Erro ao buscar produto por nome:', error);
            return undefined;
        }
    }

    /**
     * Busca produtos por faixa de preço
     */
    async getProductsByPriceRange(minPrice: number, maxPrice: number): Promise<Product[]> {
        try {
            if (minPrice < 0 || maxPrice < 0 || minPrice > maxPrice) {
                return [];
            }

            return await this.productService.getProductsByPriceRange(minPrice, maxPrice);
        } catch (error) {
            console.error('Erro ao buscar produtos por faixa de preço:', error);
            return [];
        }
    }

    /**
     * Pesquisa produtos por termo
     */
    async searchProducts(searchTerm: string): Promise<Product[]> {
        try {
            if (!searchTerm || searchTerm.trim().length === 0) {
                return await this.getAllProducts();
            }

            return await this.productService.searchProducts(searchTerm.trim());
        } catch (error) {
            console.error('Erro ao pesquisar produtos:', error);
            return [];
        }
    }

    /**
     * Aplica desconto por categoria
     */
    applyCategoryDiscount(category: CategoryType, percent: number): { success: boolean; message: string } {
        try {
            if (percent <= 0 || percent > 100) {
                return { success: false, message: 'Percentual deve estar entre 1 e 100' };
            }

            this.priceCalculator = new CategoryPercentOff(new BasicPrice(), category, percent / 100);
            return { 
                success: true, 
                message: `Desconto de ${percent}% aplicado à categoria ${category}` 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: `Erro ao aplicar desconto: ${error.message}` 
            };
        }
    }

    /**
     * Aplica cupom de desconto
     */
    applyCouponDiscount(percent: number): { success: boolean; message: string } {
        try {
            if (percent <= 0 || percent > 100) {
                return { success: false, message: 'Percentual deve estar entre 1 e 100' };
            }

            this.priceCalculator = new CouponPercentOff(this.priceCalculator, percent / 100);
            return { 
                success: true, 
                message: `Cupom de ${percent}% aplicado a todos os produtos` 
            };
        } catch (error: any) {
            return { 
                success: false, 
                message: `Erro ao aplicar cupom: ${error.message}` 
            };
        }
    }

    /**
     * Remove todos os descontos
     */
    clearDiscounts(): { success: boolean; message: string } {
        try {
            this.priceCalculator = new BasicPrice();
            return { success: true, message: 'Descontos removidos com sucesso' };
        } catch (error: any) {
            return { 
                success: false, 
                message: `Erro ao remover descontos: ${error.message}` 
            };
        }
    }

    /**
     * Calcula o preço final de um produto com descontos aplicados
     */
    calculateFinalPrice(product: Product): { 
        originalPrice: number; 
        finalPrice: number; 
        discount: number; 
        discountPercent: number 
    } {
        try {
            const originalPrice = product.price;
            const finalPrice = this.priceCalculator.total(product);
            const discount = originalPrice - finalPrice;
            const discountPercent = originalPrice > 0 ? (discount / originalPrice) * 100 : 0;

            return {
                originalPrice,
                finalPrice,
                discount,
                discountPercent
            };
        } catch (error) {
            console.error('Erro ao calcular preço final:', error);
            return {
                originalPrice: product.price,
                finalPrice: product.price,
                discount: 0,
                discountPercent: 0
            };
        }
    }

    /**
     * Obtém estatísticas dos produtos
     */
    async getProductStats(): Promise<{
        total: number;
        averagePrice: number;
        mostExpensive: string | null;
        cheapest: string | null;
        byCategory: { [key: string]: number };
    }> {
        try {
            return await this.productService.getProductStatistics();
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
     * Atualiza um produto existente
     */
    async updateProduct(name: string, updates: Partial<Omit<Product, 'name'>>): Promise<{ success: boolean; message: string }> {
        try {
            if (!name || name.trim().length === 0) {
                return { success: false, message: 'Nome do produto é obrigatório' };
            }

            // Validar atualizações
            if (updates.price !== undefined && updates.price <= 0) {
                return { success: false, message: 'Preço deve ser maior que zero' };
            }

            if (updates.category !== undefined && !Object.values(Category).includes(updates.category as any)) {
                return { success: false, message: 'Categoria inválida' };
            }

            return await this.productService.updateProduct(name.trim(), updates);
        } catch (error: any) {
            return { 
                success: false, 
                message: `Erro ao atualizar produto: ${error.message}` 
            };
        }
    }

    /**
     * Limpa todos os produtos
     */
    async clearAllProducts(): Promise<{ success: boolean; message: string }> {
        try {
            return await this.productService.clearAllProducts();
        } catch (error: any) {
            return { 
                success: false, 
                message: `Erro ao limpar produtos: ${error.message}` 
            };
        }
    }

    /**
     * Verifica se um produto existe
     */
    async productExists(name: string): Promise<boolean> {
        try {
            if (!name || name.trim().length === 0) {
                return false;
            }

            return await this.productService.productExists(name.trim());
        } catch (error) {
            console.error('Erro ao verificar existência do produto:', error);
            return false;
        }
    }

    /**
     * Testa a conexão com o banco de dados
     */
    async testDatabaseConnection(): Promise<{ success: boolean; message: string }> {
        try {
            return await this.productService.testDatabaseConnection();
        } catch (error: any) {
            return {
                success: false,
                message: `Erro ao testar conexão: ${error.message}`
            };
        }
    }
}