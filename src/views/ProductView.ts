import { Product } from '../models/Product';
import { Category, CategoryUtils } from '../models/Category';

/**
 * View para exibição de produtos
 * Implementa a camada de visualização do padrão MVC
 */
export class ProductView {
    
    /**
     * Exibe o cabeçalho da aplicação
     */
    showHeader(): void {
        console.log('='.repeat(60));
        console.log('🛍️  SISTEMA DE GERENCIAMENTO DE PRODUTOS');
        console.log('='.repeat(60));
    }

    /**
     * Exibe mensagem de sucesso
     */
    showSuccess(message: string): void {
        console.log(`✅ ${message}`);
    }

    /**
     * Exibe mensagem de erro
     */
    showError(message: string): void {
        console.log(`❌ ${message}`);
    }

    /**
     * Exibe mensagem de informação
     */
    showInfo(message: string): void {
        console.log(`ℹ️  ${message}`);
    }

    /**
     * Exibe uma linha separadora
     */
    showSeparator(): void {
        console.log('-'.repeat(50));
    }

    /**
     * Exibe título de seção
     */
    showSectionTitle(title: string): void {
        console.log(`\n📋 ${title}`);
        this.showSeparator();
    }

    /**
     * Exibe um produto individual
     */
    showProduct(product: Product, priceInfo?: {
        originalPrice: number;
        finalPrice: number;
        discount: number;
        discountPercentage: number;
    }): void {
        console.log(`📦 ${product.name}`);
        console.log(`   🏷️  Categoria: ${CategoryUtils.getDisplayName(product.category)}`);
        
        if (priceInfo) {
            console.log(`   💰 Preço original: R$ ${priceInfo.originalPrice.toFixed(2)}`);
            if (priceInfo.discount > 0) {
                console.log(`   🎯 Preço final: R$ ${priceInfo.finalPrice.toFixed(2)}`);
                console.log(`   💸 Desconto: R$ ${priceInfo.discount.toFixed(2)} (${priceInfo.discountPercentage.toFixed(1)}%)`);
            } else {
                console.log(`   💰 Preço: R$ ${priceInfo.finalPrice.toFixed(2)}`);
            }
        } else {
            console.log(`   💰 Preço: R$ ${product.price.toFixed(2)}`);
        }
        console.log();
    }

    /**
     * Exibe lista de produtos
     */
    showProductList(products: Product[], title: string = 'Produtos'): void {
        this.showSectionTitle(title);
        
        if (products.length === 0) {
            this.showInfo('Nenhum produto encontrado.');
            return;
        }

        products.forEach((product, index) => {
            console.log(`${index + 1}. ${product.name} - ${CategoryUtils.getDisplayName(product.category)} - R$ ${product.price.toFixed(2)}`);
        });
        
        console.log(`\nTotal: ${products.length} produto(s)`);
    }

    /**
     * Exibe lista detalhada de produtos com informações de preço
     */
    showDetailedProductList(
        products: Product[], 
        priceInfos: Array<{
            originalPrice: number;
            finalPrice: number;
            discount: number;
            discountPercentage: number;
        }>,
        title: string = 'Produtos Detalhados'
    ): void {
        this.showSectionTitle(title);
        
        if (products.length === 0) {
            this.showInfo('Nenhum produto encontrado.');
            return;
        }

        products.forEach((product, index) => {
            this.showProduct(product, priceInfos[index]);
        });
    }

    /**
     * Exibe as categorias disponíveis
     */
    showCategories(): void {
        this.showSectionTitle('Categorias Disponíveis');
        
        const categories = CategoryUtils.getAllCategories();
        categories.forEach((category, index) => {
            console.log(`${index + 1}. ${CategoryUtils.getDisplayName(category)} (${category})`);
        });
    }

    /**
     * Exibe estatísticas dos produtos
     */
    showProductStats(stats: {
        totalProducts: number;
        productsByCategory: Record<string, number>;
        averagePrice: number;
        mostExpensiveProduct?: Product;
        cheapestProduct?: Product;
    }): void {
        this.showSectionTitle('Estatísticas dos Produtos');
        
        console.log(`📊 Total de produtos: ${stats.totalProducts}`);
        console.log(`💰 Preço médio: R$ ${stats.averagePrice.toFixed(2)}`);
        
        if (stats.mostExpensiveProduct) {
            console.log(`🔝 Mais caro: ${stats.mostExpensiveProduct.name} - R$ ${stats.mostExpensiveProduct.price.toFixed(2)}`);
        }
        
        if (stats.cheapestProduct) {
            console.log(`💸 Mais barato: ${stats.cheapestProduct.name} - R$ ${stats.cheapestProduct.price.toFixed(2)}`);
        }
        
        console.log('\n📈 Produtos por categoria:');
        Object.entries(stats.productsByCategory).forEach(([category, count]) => {
            console.log(`   ${CategoryUtils.getDisplayName(category as Category)}: ${count} produto(s)`);
        });
    }

    /**
     * Exibe menu de opções
     */
    showMenu(): void {
        this.showSectionTitle('Menu de Opções');
        console.log('1. Adicionar produto');
        console.log('2. Listar todos os produtos');
        console.log('3. Buscar produto por nome');
        console.log('4. Listar produtos por categoria');
        console.log('5. Aplicar desconto por categoria');
        console.log('6. Aplicar cupom de desconto');
        console.log('7. Remover descontos');
        console.log('8. Remover produto');
        console.log('9. Exibir estatísticas');
        console.log('0. Sair');
        console.log();
    }

    /**
     * Exibe mensagem de despedida
     */
    showGoodbye(): void {
        console.log('\n👋 Obrigado por usar o Sistema de Gerenciamento de Produtos!');
        console.log('='.repeat(60));
    }
}