import { Category } from './Category';

/**
 * Modelo de produto que utiliza a enum Category
 */
export class Product {
    public name: string;
    public category: Category;
    public price: number;

    constructor(name: string, category: Category, price: number) {
        this.name = name;
        this.category = category;
        this.price = price;
    }

    /**
     * Retorna uma representação em string do produto
     */
    toString(): string {
        return `Product(name=${this.name}, price=R$${this.price.toFixed(2)}, category=${this.category})`;
    }

    /**
     * Verifica se o produto está na categoria especificada
     */
    isInCategory(category: Category): boolean {
        return this.category === category;
    }

    /**
     * Calcula o preço com desconto baseado na categoria
     */
    // getPriceWithDiscount(): number {
    //     let discountPercentage = 0;

    //     switch (this.category) {
    //         case Category.LIVROS:
    //             discountPercentage = 0.10; // 10% de desconto em livros
    //             break;
    //         case Category.ELETRONICOS:
    //             discountPercentage = 0.05; // 5% de desconto em eletrônicos
    //             break;
    //         case Category.ALIMENTOS:
    //             discountPercentage = 0.02; // 2% de desconto em alimentos
    //             break;
    //     }

    //     return this.price * (1 - discountPercentage);
    // }

    /**
     * Retorna informações detalhadas do produto
     */
    getProductInfo(): string {
        const originalPrice = this.price.toFixed(2);
        // const discountedPrice = this.getPriceWithDiscount().toFixed(2);
        // const savings = (this.price - this.getPriceWithDiscount()).toFixed(2);

        return `
📦 ${this.name}
🏷️  Categoria: ${this.category}
💰 Preço: R$ ${originalPrice}
        `.trim();
        
        // 🎯 Com desconto: R$ ${discountedPrice}
        // 💸 Economia: R$ ${savings}
    }
}