import { ProductFilter } from './ProductFilter.js';

/**
 * Filtro base que não aplica nenhuma filtragem
 * Implementa o padrão Decorator como componente concreto base
 */
export class BaseFilter implements ProductFilter {
    async filter(products: any[]): Promise<any[]> {
        return [...products]; // Retorna cópia de todos os produtos
    }
    
    getDescription(): string {
        return 'Filtro base (sem filtragem)';
    }
}

/**
 * Decorator abstrato base para filtros
 * Define a estrutura para decoradores de filtros
 */
export abstract class FilterDecorator implements ProductFilter {
    protected baseFilter: ProductFilter;
    
    constructor(filter: ProductFilter) {
        this.baseFilter = filter;
    }
    
    abstract filter(products: any[]): Promise<any[]>;
    abstract getDescription(): string;
}

/**
 * Filtro concreto para categoria
 * Decora um filtro existente adicionando filtragem por categoria
 */
export class CategoryFilter extends FilterDecorator {
    private category: string;
    
    constructor(filter: ProductFilter, category: string) {
        super(filter);
        this.category = category;
    }
    
    async filter(products: any[]): Promise<any[]> {
        const baseFiltered = await this.baseFilter.filter(products);
        return baseFiltered.filter(product => 
            product.category.toLowerCase() === this.category.toLowerCase()
        );
    }
    
    getDescription(): string {
        const baseDesc = this.baseFilter.getDescription();
        const categoryDesc = `Categoria: ${this.category}`;
        return baseDesc === 'Filtro base (sem filtragem)' 
            ? categoryDesc 
            : `${baseDesc} + ${categoryDesc}`;
    }
}

/**
 * Filtro concreto para busca textual
 * Decora um filtro existente adicionando busca por nome
 */
export class SearchFilter extends FilterDecorator {
    private searchTerm: string;
    
    constructor(filter: ProductFilter, searchTerm: string) {
        super(filter);
        this.searchTerm = searchTerm;
    }
    
    async filter(products: any[]): Promise<any[]> {
        const baseFiltered = await this.baseFilter.filter(products);
        const term = this.searchTerm.toLowerCase();
        return baseFiltered.filter(product => 
            product.name.toLowerCase().includes(term) ||
            (product.description && product.description.toLowerCase().includes(term))
        );
    }
    
    getDescription(): string {
        const baseDesc = this.baseFilter.getDescription();
        const searchDesc = `Busca: "${this.searchTerm}"`;
        return baseDesc === 'Filtro base (sem filtragem)' 
            ? searchDesc 
            : `${baseDesc} + ${searchDesc}`;
    }
}

/**
 * Filtro concreto para faixa de preço
 * Decora um filtro existente adicionando filtragem por preço
 */
export class PriceRangeFilter extends FilterDecorator {
    private minPrice?: number;
    private maxPrice?: number;
    
    constructor(filter: ProductFilter, minPrice?: number, maxPrice?: number) {
        super(filter);
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
    }
    
    async filter(products: any[]): Promise<any[]> {
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
    
    getDescription(): string {
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
 * Filtro concreto para produtos em estoque
 * Decora um filtro existente adicionando filtragem por disponibilidade
 */
export class StockFilter extends FilterDecorator {
    private inStockOnly: boolean;
    
    constructor(filter: ProductFilter, inStockOnly: boolean = true) {
        super(filter);
        this.inStockOnly = inStockOnly;
    }
    
    async filter(products: any[]): Promise<any[]> {
        const baseFiltered = await this.baseFilter.filter(products);
        
        if (!this.inStockOnly) {
            return baseFiltered;
        }
        
        return baseFiltered.filter(product => {
            const stock = parseInt(product.stock_quantity) || 0;
            return stock > 0;
        });
    }
    
    getDescription(): string {
        const baseDesc = this.baseFilter.getDescription();
        const stockDesc = this.inStockOnly ? 'Apenas em estoque' : 'Incluir sem estoque';
        return baseDesc === 'Filtro base (sem filtragem)' 
            ? stockDesc 
            : `${baseDesc} + ${stockDesc}`;
    }
}

/**
 * Factory para criar filtros compostos
 * Implementa o padrão Factory para facilitar a criação de filtros complexos
 */
export class FilterFactory {
    /**
     * Cria filtro composto com categoria e busca
     */
    static createCategoryAndSearchFilter(category?: string, searchTerm?: string): ProductFilter {
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
     * Cria filtro completo com todos os parâmetros possíveis
     */
    static createCompleteFilter(
        category?: string,
        searchTerm?: string,
        minPrice?: number,
        maxPrice?: number,
        inStockOnly?: boolean
    ): ProductFilter {
        let filter: ProductFilter = new BaseFilter();
        
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
    
    /**
     * Cria filtro por preço
     */
    static createPriceFilter(minPrice?: number, maxPrice?: number): ProductFilter {
        return new PriceRangeFilter(new BaseFilter(), minPrice, maxPrice);
    }
}