import { PriceCalc } from '../models/PriceCalc';
import { Product, Category, CategoryType } from '../models/Product';

/**
 * Implementação básica da interface PriceCalc
 * Retorna o preço original do produto
 */
export class BasicPrice implements PriceCalc {
    total(p: Product): number {
        return p.price;
    }
}

/**
 * Classe abstrata PriceDecorator que implementa o padrão Decorator
 * para cálculos de preço. Permite adicionar comportamentos adicionais
 * a um PriceCalc existente de forma dinâmica.
 */
export abstract class PriceDecorator implements PriceCalc {
    protected inner: PriceCalc;

    constructor(inner: PriceCalc) {
        this.inner = inner;
    }

    /**
     * Método abstrato que deve ser implementado pelas classes filhas
     * para definir como o preço será calculado
     * @param p - O produto para calcular o preço
     * @returns O preço total como número decimal
     */
    abstract total(p: Product): number;
}

/**
 * Decorator que aplica desconto percentual para uma categoria específica
 */
export class CategoryPercentOff extends PriceDecorator {
    private category: CategoryType;
    private percent: number;

    constructor(inner: PriceCalc, category: CategoryType, percent: number) {
        super(inner);
        this.category = category;
        this.percent = percent;
    }

    total(p: Product): number {
        const basePrice = this.inner.total(p);
        
        // Aplica desconto apenas se a categoria do produto for igual à categoria do decorator
        if (p.category === this.category) {
            return basePrice * (1 - this.percent);
        }
        
        return basePrice;
    }
}

/**
 * Decorator que aplica desconto percentual usando cupom
 */
export class CouponPercentOff extends PriceDecorator {
    private percent: number;

    constructor(inner: PriceCalc, percent: number) {
        super(inner);
        this.percent = percent;
    }

    total(p: Product): number {
        const basePrice = this.inner.total(p);
        return basePrice * (1 - this.percent);
    }
}

/**
 * Decorator que adiciona uma taxa de frete baseada na categoria do produto
 */
export class ShippingDecorator extends PriceDecorator {
    total(p: Product): number {
        const basePrice = this.inner.total(p);
        let shippingCost = 0;

        // Taxa de frete baseada na categoria
        switch (p.category) {
            case Category.ELETRONICOS:
                shippingCost = 25.00; // Produtos eletrônicos são mais pesados
                break;
            case Category.LIVROS:
                shippingCost = 10.00; // Livros têm frete moderado
                break;
            case Category.ALIMENTOS:
                shippingCost = 15.00; // Alimentos podem precisar refrigeração
                break;
        }

        return basePrice + shippingCost;
    }
}


