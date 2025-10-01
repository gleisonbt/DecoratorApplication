import { Product } from '../models/Product';
import { Category } from '../models/Category';

/**
 * Serviço para gerenciamento de produtos
 * Implementa a camada de serviço/modelo do padrão MVC
 */
export class ProductService {
    private products: Product[] = [];

    /**
     * Adiciona um novo produto
     */
    addProduct(product: Product): void {
        // Verifica se já existe um produto com o mesmo nome
        if (this.findProductByName(product.name)) {
            throw new Error(`Produto com nome "${product.name}" já existe`);
        }
        
        this.products.push(product);
    }

    /**
     * Remove um produto pelo nome
     */
    removeProduct(name: string): boolean {
        const index = this.products.findIndex(product => 
            product.name.toLowerCase() === name.toLowerCase()
        );
        
        if (index !== -1) {
            this.products.splice(index, 1);
            return true;
        }
        
        return false;
    }

    /**
     * Busca um produto pelo nome
     */
    findProductByName(name: string): Product | undefined {
        return this.products.find(product => 
            product.name.toLowerCase() === name.toLowerCase()
        );
    }

    /**
     * Retorna todos os produtos
     */
    getAllProducts(): Product[] {
        return [...this.products]; // Retorna uma cópia para evitar modificações externas
    }

    /**
     * Busca produtos por categoria
     */
    getProductsByCategory(category: Category): Product[] {
        return this.products.filter(product => product.category === category);
    }

    /**
     * Atualiza um produto existente
     */
    updateProduct(name: string, updates: Partial<Omit<Product, 'name'>>): boolean {
        const product = this.findProductByName(name);
        if (!product) {
            return false;
        }

        if (updates.category) {
            product.category = updates.category;
        }
        
        if (updates.price !== undefined && updates.price > 0) {
            product.price = updates.price;
        }

        return true;
    }

    /**
     * Retorna a quantidade total de produtos
     */
    getProductCount(): number {
        return this.products.length;
    }

    /**
     * Retorna produtos ordenados por preço
     */
    getProductsSortedByPrice(ascending: boolean = true): Product[] {
        return [...this.products].sort((a, b) => 
            ascending ? a.price - b.price : b.price - a.price
        );
    }

    /**
     * Retorna produtos ordenados por nome
     */
    getProductsSortedByName(): Product[] {
        return [...this.products].sort((a, b) => 
            a.name.localeCompare(b.name)
        );
    }

    /**
     * Busca produtos por faixa de preço
     */
    getProductsByPriceRange(minPrice: number, maxPrice: number): Product[] {
        return this.products.filter(product => 
            product.price >= minPrice && product.price <= maxPrice
        );
    }

    /**
     * Limpa todos os produtos
     */
    clearAllProducts(): void {
        this.products = [];
    }
}