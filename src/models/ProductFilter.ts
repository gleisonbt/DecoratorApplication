import { Product } from './Product';

/**
 * Interface base para filtros de produtos
 * Define o contrato para aplicação do padrão Decorator em filtros
 */
export interface ProductFilter {
    /**
     * Filtra uma lista de produtos com base nos critérios implementados
     * @param products Lista de produtos a ser filtrada
     * @returns Lista de produtos filtrados
     */
    filter(products: Product[]): Product[];
    
    /**
     * Retorna descrição do filtro para debugging/logging
     */
    getDescription(): string;
}