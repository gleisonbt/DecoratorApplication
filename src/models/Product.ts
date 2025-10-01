/**
 * Enum para categorias de produtos (compatível com Node.js)
 */
export const Category = {
    ELETRONICOS: 'eletronicos' as const,
    LIVROS: 'livros' as const, 
    ALIMENTOS: 'alimentos' as const
} as const;

export type CategoryType = typeof Category[keyof typeof Category];

/**
 * Interface para dados do produto
 */
export interface ProductData {
    id?: number | null;
    name?: string;
    category?: string;
    price?: number | string;
    description?: string;
    sku?: string;
    stock_quantity?: number | string;
    image_url?: string;
    created_at?: string | null;
    updated_at?: string | null;
    is_active?: boolean;
    category_display_name?: string;
    category_icon?: string;
}

/**
 * Modelo de produto
 */
export class Product {
    public id: number | null;
    public name: string;
    public category: string;
    public price: number;
    public description: string;
    public sku: string;
    public stock_quantity: number;
    public image_url: string;
    public created_at: string | null;
    public updated_at: string | null;
    public is_active: boolean;
    public category_display_name: string;
    public category_icon: string;

    constructor(data: ProductData = {}) {
        this.id = data.id || null;
        this.name = data.name || '';
        this.category = data.category || '';
        this.price = parseFloat(String(data.price)) || 0;
        this.description = data.description || '';
        this.sku = data.sku || '';
        this.stock_quantity = parseInt(String(data.stock_quantity)) || 0;
        this.image_url = data.image_url || '';
        this.created_at = data.created_at || null;
        this.updated_at = data.updated_at || null;
        this.is_active = data.is_active !== undefined ? data.is_active : true;
        
        // Dados da categoria (quando join é feito)
        this.category_display_name = data.category_display_name || '';
        this.category_icon = data.category_icon || '';
    }

    /**
     * Retorna uma representação em string do produto
     */
    toString(): string {
        return `Product(id=${this.id}, name=${this.name}, price=R$${this.price.toFixed(2)}, category=${this.category})`;
    }

    /**
     * Verifica se o produto está na categoria especificada
     */
    isInCategory(category: string): boolean {
        return this.category === category;
    }

    /**
     * Retorna objeto para ser enviado na API (sem dados internos)
     */
    toJSON(): Record<string, any> {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            price: this.price,
            description: this.description,
            sku: this.sku,
            stock_quantity: this.stock_quantity,
            image_url: this.image_url,
            created_at: this.created_at,
            updated_at: this.updated_at
        };
    }

    /**
     * Retorna dados para criação/atualização no banco
     */
    toDatabase(): Record<string, any> {
        const data: Record<string, any> = {
            name: this.name,
            category: this.category,
            price: this.price
        };

        if (this.description) data.description = this.description;
        if (this.sku) data.sku = this.sku;
        if (this.stock_quantity !== undefined) data.stock_quantity = this.stock_quantity;
        if (this.image_url) data.image_url = this.image_url;

        return data;
    }

    /**
     * Valida se o produto tem dados obrigatórios
     */
    isValid(): boolean {
        return Boolean(this.name) && 
               Boolean(this.category) && 
               this.price > 0 &&
               Object.values(Category).includes(this.category as CategoryType);
    }

    /**
     * Cria uma cópia do produto com novos dados
     */
    withChanges(changes: Partial<ProductData>): Product {
        return new Product({ ...this.toJSON(), ...changes });
    }

    /**
     * Retorna o nome de exibição da categoria
     */
    getCategoryDisplayName(): string {
        const categoryNames: Record<string, string> = {
            [Category.ELETRONICOS]: 'Eletrônicos',
            [Category.LIVROS]: 'Livros',
            [Category.ALIMENTOS]: 'Alimentos'
        };
        return categoryNames[this.category] || this.category;
    }
}

// Para compatibilidade com CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Product, Category };
}