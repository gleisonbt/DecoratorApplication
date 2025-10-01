// Models
import { Product } from '../models/Product';
import { Category } from '../models/Category';
import { PriceCalc } from '../models/PriceCalc';

// Services
import { ProductService } from '../services/ProductService';
import { BasicPrice, CategoryPercentOff, CouponPercentOff } from '../services/PriceCalculators';

/**
 * Controller para gerenciar produtos
 * Implementa a camada de controle do padrão MVC
 */
export class ProductController {
    private productService: ProductService;
    private priceCalculator: PriceCalc;

    constructor() {
        this.productService = new ProductService();
        this.priceCalculator = new BasicPrice(); // Calculador padrão
    }

    /**
     * Adiciona um novo produto
     */
    addProduct(name: string, category: Category, price: number): { success: boolean; message: string; product?: Product } {
        try {
            if (!name || name.trim().length === 0) {
                return { success: false, message: 'Nome do produto é obrigatório' };
            }

            if (price <= 0) {
                return { success: false, message: 'Preço deve ser maior que zero' };
            }

            const product = new Product(name.trim(), category, price);
            this.productService.addProduct(product);

            return { 
                success: true, 
                message: 'Produto adicionado com sucesso!', 
                product 
            };
        } catch (error) {
            return { 
                success: false, 
                message: `Erro ao adicionar produto: ${error}` 
            };
        }
    }

    /**
     * Lista todos os produtos
     */
    getAllProducts(): Product[] {
        return this.productService.getAllProducts();
    }

    /**
     * Busca produtos por categoria
     */
    getProductsByCategory(category: Category): Product[] {
        return this.productService.getProductsByCategory(category);
    }

    /**
     * Busca produto por nome
     */
    findProductByName(name: string): Product | undefined {
        return this.productService.findProductByName(name);
    }

    /**
     * Remove um produto
     */
    removeProduct(name: string): { success: boolean; message: string } {
        const success = this.productService.removeProduct(name);
        return {
            success,
            message: success ? 'Produto removido com sucesso!' : 'Produto não encontrado'
        };
    }

    /**
     * Aplica desconto por categoria
     */
    applyCategoryDiscount(category: Category, percent: number): void {
        this.priceCalculator = new CategoryPercentOff(new BasicPrice(), category, percent);
    }

    /**
     * Aplica cupom de desconto
     */
    applyCouponDiscount(percent: number): void {
        this.priceCalculator = new CouponPercentOff(this.priceCalculator, percent);
    }

    /**
     * Remove todos os descontos
     */
    clearDiscounts(): void {
        this.priceCalculator = new BasicPrice();
    }

    /**
     * Calcula o preço final de um produto com descontos aplicados
     */
    calculateFinalPrice(product: Product): number {
        return this.priceCalculator.total(product);
    }

    /**
     * Obtém informações detalhadas de preço de um produto
     */
    getProductPriceInfo(product: Product): {
        originalPrice: number;
        finalPrice: number;
        discount: number;
        discountPercentage: number;
    } {
        const originalPrice = product.price;
        const finalPrice = this.calculateFinalPrice(product);
        const discount = originalPrice - finalPrice;
        const discountPercentage = originalPrice > 0 ? (discount / originalPrice) * 100 : 0;

        return {
            originalPrice,
            finalPrice,
            discount,
            discountPercentage
        };
    }

    /**
     * Obtém estatísticas dos produtos
     */
    getProductStats(): {
        totalProducts: number;
        productsByCategory: Record<string, number>;
        averagePrice: number;
        mostExpensiveProduct?: Product;
        cheapestProduct?: Product;
    } {
        const products = this.getAllProducts();
        const totalProducts = products.length;

        if (totalProducts === 0) {
            return {
                totalProducts: 0,
                productsByCategory: {},
                averagePrice: 0
            };
        }

        // Produtos por categoria
        const productsByCategory: Record<string, number> = {};
        products.forEach(product => {
            productsByCategory[product.category] = (productsByCategory[product.category] || 0) + 1;
        });

        // Preço médio
        const totalPrice = products.reduce((sum, product) => sum + product.price, 0);
        const averagePrice = totalPrice / totalProducts;

        // Produto mais caro e mais barato
        const sortedByPrice = [...products].sort((a, b) => a.price - b.price);
        const cheapestProduct = sortedByPrice[0];
        const mostExpensiveProduct = sortedByPrice[sortedByPrice.length - 1];

        return {
            totalProducts,
            productsByCategory,
            averagePrice,
            mostExpensiveProduct,
            cheapestProduct
        };
    }
}