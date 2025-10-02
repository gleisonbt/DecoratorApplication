/**
 * Interface para filtros de produtos usando padrão Decorator
 * Define o contrato para filtros que podem ser compostos
 */
export interface ProductFilter {
    /**
     * Aplica o filtro aos produtos
     * @param products Array de produtos para filtrar
     * @returns Promise com produtos filtrados
     */
    filter(products: any[]): Promise<any[]>;
    
    /**
     * Retorna descrição do filtro para logs/debug
     * @returns Descrição textual do filtro
     */
    getDescription(): string;
}