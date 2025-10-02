import { FilterFactory } from '../filters/ProductFilters.js';

// Interface para repositório de produtos
interface IProductRepository {
    findAll(): Promise<{ success: boolean; data: any[]; error?: string }>;
}

// Interface para produto
interface Product {
    name: string;
    category: string;
    price: number | string;
    description?: string;
    sku?: string;
    stock_quantity?: number | string;
}

/**
 * Serviço para filtragem de produtos no backend
 * Implementa padrão Decorator para filtros compostos
 */
export class ProductFilterService {
    private productRepository: IProductRepository;
    
    constructor(productRepository: IProductRepository) {
        this.productRepository = productRepository;
    }
    
    /**
     * Aplica filtros aos produtos usando padrão Decorator
     */
    async filterProducts(filterParams: {
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        inStockOnly?: boolean;
        limit?: number;
        offset?: number;
    }) {
        try {
            // Buscar todos os produtos do repositório
            const productsResult = await this.productRepository.findAll();
            
            if (!productsResult.success) {
                return {
                    success: false,
                    message: 'Erro ao buscar produtos do banco de dados',
                    error: productsResult.error
                };
            }
            
            const allProducts = productsResult.data;
            
            // Criar filtro composto usando Factory
            const filter = FilterFactory.createCompleteFilter(
                filterParams.category,
                filterParams.search,
                filterParams.minPrice,
                filterParams.maxPrice,
                filterParams.inStockOnly
            );
            
            // Aplicar filtros
            const filteredProducts = await filter.filter(allProducts);
            
            // Log para debug
            console.log('🔍 Filtro aplicado:', filter.getDescription());
            console.log('📊 Produtos encontrados:', filteredProducts.length, 'de', allProducts.length);
            
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
                original: allProducts.length,
                filter: filter.getDescription(),
                pagination: filterParams.limit ? {
                    limit: filterParams.limit,
                    offset: filterParams.offset || 0,
                    hasNext: (filterParams.offset || 0) + filterParams.limit < filteredProducts.length
                } : null
            };
            
        } catch (error) {
            console.error('Erro ao filtrar produtos:', error);
            return {
                success: false,
                message: 'Erro interno do servidor ao filtrar produtos',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }
    
    /**
     * Obtém categorias disponíveis (para filtros)
     */
    async getAvailableCategories() {
        try {
            const productsResult = await this.productRepository.findAll();
            
            if (!productsResult.success) {
                return {
                    success: false,
                    message: 'Erro ao buscar produtos do banco de dados',
                    error: productsResult.error
                };
            }
            
            const categories = [...new Set(productsResult.data.map((p: Product) => p.category))];
            
            return {
                success: true,
                data: categories.sort()
            };
        } catch (error) {
            console.error('Erro ao buscar categorias:', error);
            return {
                success: false,
                message: 'Erro ao buscar categorias disponíveis',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }
    
    /**
     * Obtém estatísticas dos produtos filtrados
     */
    async getFilteredStats(filterParams: {
        category?: string;
        search?: string;
        minPrice?: number;
        maxPrice?: number;
        inStockOnly?: boolean;
    }) {
        try {
            const result = await this.filterProducts(filterParams);
            
            if (!result.success || !result.data) {
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
            
            const prices = products.map((p: Product) => parseFloat(String(p.price)));
            const totalValue = prices.reduce((sum, price) => sum + price, 0);
            const inStockProducts = products.filter((p: Product) => (parseInt(String(p.stock_quantity)) || 0) > 0);
            
            return {
                success: true,
                data: {
                    total: products.length,
                    averagePrice: totalValue / products.length,
                    minPrice: Math.min(...prices),
                    maxPrice: Math.max(...prices),
                    totalValue,
                    categoriesCount: new Set(products.map((p: Product) => p.category)).size,
                    inStockCount: inStockProducts.length,
                    outOfStockCount: products.length - inStockProducts.length
                }
            };
            
        } catch (error) {
            console.error('Erro ao calcular estatísticas:', error);
            return {
                success: false,
                message: 'Erro ao calcular estatísticas',
                error: error instanceof Error ? error.message : 'Erro desconhecido'
            };
        }
    }
}