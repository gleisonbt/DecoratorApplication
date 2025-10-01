/**
 * Enum para categorias de produtos
 */
export enum Category {
    ELETRONICOS = 'eletronicos',
    LIVROS = 'livros',
    ALIMENTOS = 'alimentos'
}

/**
 * Utilitários para trabalhar com categorias
 */
export class CategoryUtils {
    /**
     * Retorna todas as categorias disponíveis
     */
    static getAllCategories(): Category[] {
        return Object.values(Category);
    }

    /**
     * Verifica se uma string é uma categoria válida
     */
    static isValidCategory(value: string): value is Category {
        return Object.values(Category).includes(value as Category);
    }

    /**
     * Converte uma string para Category (com validação)
     */
    static fromString(value: string): Category {
        if (this.isValidCategory(value)) {
            return value as Category;
        }
        throw new Error(`Categoria inválida: ${value}. Categorias válidas: ${this.getAllCategories().join(', ')}`);
    }

    /**
     * Retorna o nome formatado da categoria para exibição
     */
    static getDisplayName(category: Category): string {
        switch (category) {
            case Category.ELETRONICOS:
                return 'Eletrônicos';
            case Category.LIVROS:
                return 'Livros';
            case Category.ALIMENTOS:
                return 'Alimentos';
            default:
                return category;
        }
    }
}