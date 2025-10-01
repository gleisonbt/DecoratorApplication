import { Product } from './Product';

/**
 * Interface para cálculo de preços de produtos
 */
export interface PriceCalc {
    /**
     * Calcula o preço total de um produto
     * @param p - O produto para calcular o preço
     * @returns O preço total como número decimal
     */
    total(p: Product): number;
}