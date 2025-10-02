import { Product, CategoryType } from '../models/Product';
import { ProductFilter } from '../models/ProductFilter';

/**
 * Filtro base - não aplica nenhuma filtragem (retorna todos os produtos)
 * Componente base do padrão Decorator para filtros
 */
export class BaseFilter implements ProductFilter {
    filter(products: Product[]): Product[] {
        return [...products]; // Retorna cópia de todos os produtos
    }
    
    getDescription(): string {
        return 'Filtro base (sem filtragem)';
    }
}

/**
 * Decorator abstrato base para filtros
 * Define a estrutura comum para todos os decorators de filtro
 */
export abstract class FilterDecorator implements ProductFilter {
    protected wrappedFilter: ProductFilter;
    
    constructor(filter: ProductFilter) {
        this.wrappedFilter = filter;
    }
    
    filter(products: Product[]): Product[] {
        // Aplica primeiro o filtro wrapeado, depois o próprio filtro
        const filteredByWrapped = this.wrappedFilter.filter(products);
        return this.applyFilter(filteredByWrapped);
    }
    
    getDescription(): string {
        return `${this.wrappedFilter.getDescription()} + ${this.getOwnDescription()}`;
    }
    
    /**
     * Implementação específica do filtro do decorator
     */
    protected abstract applyFilter(products: Product[]): Product[];
    
    /**
     * Descrição específica do filtro do decorator
     */
    protected abstract getOwnDescription(): string;
}

/**
 * Decorator para filtrar produtos por categoria
 */
export class CategoryFilter extends FilterDecorator {
    private category: CategoryType | null;
    
    constructor(filter: ProductFilter, category: CategoryType | null = null) {
        super(filter);
        this.category = category;
    }
    
    /**
     * Define a categoria para filtrar
     */
    setCategory(category: CategoryType | null): void {
        this.category = category;
    }
    
    protected applyFilter(products: Product[]): Product[] {
        if (!this.category) {
            return products; // Sem categoria selecionada, retorna todos
        }
        
        return products.filter(product => product.category === this.category);
    }
    
    protected getOwnDescription(): string {
        return this.category ? `Categoria: ${this.category}` : 'Categoria: Todas';
    }
}

/**
 * Decorator para filtrar produtos por busca textual
 */
export class SearchFilter extends FilterDecorator {
    private searchTerm: string;
    
    constructor(filter: ProductFilter, searchTerm: string = '') {
        super(filter);
        this.searchTerm = searchTerm.toLowerCase();
    }
    
    /**
     * Define o termo de busca
     */
    setSearchTerm(searchTerm: string): void {
        this.searchTerm = searchTerm.toLowerCase();
    }
    
    protected applyFilter(products: Product[]): Product[] {
        if (!this.searchTerm.trim()) {
            return products; // Sem termo de busca, retorna todos
        }
        
        return products.filter(product => {
            const nameMatch = product.name.toLowerCase().includes(this.searchTerm);
            const descriptionMatch = product.description?.toLowerCase().includes(this.searchTerm) || false;
            
            return nameMatch || descriptionMatch;
        });
    }
    
    protected getOwnDescription(): string {
        return this.searchTerm ? `Busca: "${this.searchTerm}"` : 'Busca: Vazia';
    }
}

/**
 * Decorator para filtrar produtos por faixa de preço
 */
export class PriceRangeFilter extends FilterDecorator {
    private minPrice: number;
    private maxPrice: number;
    
    constructor(filter: ProductFilter, minPrice: number = 0, maxPrice: number = Number.MAX_VALUE) {
        super(filter);
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }
    
    /**
     * Define a faixa de preço para filtrar
     */
    setPriceRange(minPrice: number, maxPrice: number): void {
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }
    
    protected applyFilter(products: Product[]): Product[] {
        return products.filter(product => 
            product.price >= this.minPrice && product.price <= this.maxPrice
        );
    }
    
    protected getOwnDescription(): string {
        if (this.minPrice === 0 && this.maxPrice === Number.MAX_VALUE) {
            return 'Preço: Todos';
        }
        return `Preço: R$ ${this.minPrice.toFixed(2)} - R$ ${this.maxPrice.toFixed(2)}`;
    }
}

/**
 * Decorator para filtrar produtos com desconto
 */
export class DiscountFilter extends FilterDecorator {
    private onlyWithDiscount: boolean;
    private priceCalculatorFn?: (product: Product) => number;
    
    constructor(filter: ProductFilter, onlyWithDiscount: boolean = false, priceCalculatorFn?: (product: Product) => number) {
        super(filter);
        this.onlyWithDiscount = onlyWithDiscount;
        this.priceCalculatorFn = priceCalculatorFn;
    }
    
    /**
     * Define se deve mostrar apenas produtos com desconto
     */
    setDiscountFilter(onlyWithDiscount: boolean): void {
        this.onlyWithDiscount = onlyWithDiscount;
    }
    
    /**
     * Define função para calcular preço final (para detectar desconto)
     */
    setPriceCalculator(priceCalculatorFn: (product: Product) => number): void {
        this.priceCalculatorFn = priceCalculatorFn;
    }
    
    protected applyFilter(products: Product[]): Product[] {
        if (!this.onlyWithDiscount || !this.priceCalculatorFn) {
            return products; // Sem filtro de desconto
        }
        
        return products.filter(product => {
            const finalPrice = this.priceCalculatorFn!(product);
            return finalPrice < product.price; // Tem desconto se preço final < preço original
        });
    }
    
    protected getOwnDescription(): string {
        return this.onlyWithDiscount ? 'Apenas com desconto' : 'Todos os produtos';
    }
}

/**
 * Factory para criar filtros compostos
 */
export class FilterFactory {
    /**
     * Cria um filtro composto com categoria e busca
     */
    static createCategoryAndSearchFilter(category: CategoryType | null, searchTerm: string): ProductFilter {
        let filter: ProductFilter = new BaseFilter();
        
        if (category) {
            filter = new CategoryFilter(filter, category);
        }
        
        if (searchTerm?.trim()) {
            filter = new SearchFilter(filter, searchTerm);
        }
        
        return filter;
    }
    
    /**
     * Cria um filtro completo com todos os critérios
     */
    static createCompleteFilter(
        category: CategoryType | null,
        searchTerm: string,
        minPrice?: number,
        maxPrice?: number,
        onlyWithDiscount?: boolean,
        priceCalculatorFn?: (product: Product) => number
    ): ProductFilter {
        let filter: ProductFilter = new BaseFilter();
        
        // Aplicar filtros em ordem lógica
        if (category) {
            filter = new CategoryFilter(filter, category);
        }
        
        if (searchTerm?.trim()) {
            filter = new SearchFilter(filter, searchTerm);
        }
        
        if (minPrice !== undefined && maxPrice !== undefined) {
            filter = new PriceRangeFilter(filter, minPrice, maxPrice);
        }
        
        if (onlyWithDiscount && priceCalculatorFn) {
            filter = new DiscountFilter(filter, onlyWithDiscount, priceCalculatorFn);
        }
        
        return filter;
    }
}