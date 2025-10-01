import { ProductController } from './controllers/ProductController';
import { ProductView } from './views/ProductView';
import { Category, CategoryUtils } from './models/Category';

/**
 * Aplicação principal que demonstra o padrão MVC
 * para gerenciamento de produtos com sistema de descontos
 */
export class App {
    private controller: ProductController;
    private view: ProductView;

    constructor() {
        this.controller = new ProductController();
        this.view = new ProductView();
    }

    /**
     * Executa a aplicação
     */
    run(): void {
        this.view.showHeader();
        
        // Demonstração do sistema
        this.demonstrateSystem();
    }

    /**
     * Demonstra as funcionalidades do sistema
     */
    private demonstrateSystem(): void {
        this.view.showSectionTitle('Demonstração do Sistema MVC');

        // 1. Adicionando produtos
        this.addSampleProducts();

        // 2. Listando todos os produtos
        this.listAllProducts();

        // 3. Aplicando desconto por categoria
        this.applyDiscountDemo();

        // 4. Aplicando cupom
        this.applyCouponDemo();

        // 5. Buscando produtos
        this.searchProductDemo();

        // 6. Exibindo estatísticas
        this.showStatistics();

        // 7. Removendo produto
        this.removeProductDemo();

        // 8. Limpando descontos
        this.clearDiscountsDemo();

        this.view.showGoodbye();
    }

    /**
     * Adiciona produtos de exemplo
     */
    private addSampleProducts(): void {
        this.view.showSectionTitle('Adicionando Produtos');

        const sampleProducts = [
            { name: 'Smartphone Samsung Galaxy', category: Category.ELETRONICOS, price: 1200.00 },
            { name: 'Notebook Dell Inspiron', category: Category.ELETRONICOS, price: 2500.00 },
            { name: 'O Senhor dos Anéis', category: Category.LIVROS, price: 45.90 },
            { name: 'Clean Code', category: Category.LIVROS, price: 89.99 },
            { name: 'Arroz Integral 1kg', category: Category.ALIMENTOS, price: 8.50 },
            { name: 'Óleo de Cozinha', category: Category.ALIMENTOS, price: 12.30 }
        ];

        sampleProducts.forEach(({ name, category, price }) => {
            const result = this.controller.addProduct(name, category, price);
            if (result.success) {
                this.view.showSuccess(`${name} adicionado com sucesso!`);
            } else {
                this.view.showError(result.message);
            }
        });
    }

    /**
     * Lista todos os produtos
     */
    private listAllProducts(): void {
        this.view.showSectionTitle('Todos os Produtos');
        const products = this.controller.getAllProducts();
        
        const priceInfos = products.map(product => 
            this.controller.getProductPriceInfo(product)
        );

        this.view.showDetailedProductList(products, priceInfos);
    }

    /**
     * Demonstra aplicação de desconto por categoria
     */
    private applyDiscountDemo(): void {
        this.view.showSectionTitle('Aplicando Desconto de 10% em Eletrônicos');
        
        this.controller.applyCategoryDiscount(Category.ELETRONICOS, 0.10);
        
        const products = this.controller.getAllProducts();
        const priceInfos = products.map(product => 
            this.controller.getProductPriceInfo(product)
        );

        this.view.showDetailedProductList(products, priceInfos, 'Produtos com Desconto por Categoria');
    }

    /**
     * Demonstra aplicação de cupom
     */
    private applyCouponDemo(): void {
        this.view.showSectionTitle('Aplicando Cupom de 5% (adicional)');
        
        this.controller.applyCouponDiscount(0.05);
        
        const products = this.controller.getAllProducts();
        const priceInfos = products.map(product => 
            this.controller.getProductPriceInfo(product)
        );

        this.view.showDetailedProductList(products, priceInfos, 'Produtos com Desconto + Cupom');
    }

    /**
     * Demonstra busca de produtos
     */
    private searchProductDemo(): void {
        this.view.showSectionTitle('Busca por Categoria - Livros');
        
        const books = this.controller.getProductsByCategory(Category.LIVROS);
        const priceInfos = books.map(product => 
            this.controller.getProductPriceInfo(product)
        );

        this.view.showDetailedProductList(books, priceInfos, 'Livros Encontrados');

        // Busca por nome
        this.view.showSectionTitle('Busca por Nome - "Clean Code"');
        const foundProduct = this.controller.findProductByName('Clean Code');
        
        if (foundProduct) {
            const priceInfo = this.controller.getProductPriceInfo(foundProduct);
            this.view.showProduct(foundProduct, priceInfo);
        } else {
            this.view.showError('Produto não encontrado');
        }
    }

    /**
     * Exibe estatísticas
     */
    private showStatistics(): void {
        const stats = this.controller.getProductStats();
        this.view.showProductStats(stats);
    }

    /**
     * Demonstra remoção de produto
     */
    private removeProductDemo(): void {
        this.view.showSectionTitle('Removendo Produto - "Óleo de Cozinha"');
        
        const result = this.controller.removeProduct('Óleo de Cozinha');
        if (result.success) {
            this.view.showSuccess(result.message);
        } else {
            this.view.showError(result.message);
        }

        // Lista produtos após remoção
        const products = this.controller.getAllProducts();
        this.view.showProductList(products, 'Produtos Após Remoção');
    }

    /**
     * Demonstra limpeza de descontos
     */
    private clearDiscountsDemo(): void {
        this.view.showSectionTitle('Removendo Todos os Descontos');
        
        this.controller.clearDiscounts();
        this.view.showSuccess('Descontos removidos!');
        
        const products = this.controller.getAllProducts();
        const priceInfos = products.map(product => 
            this.controller.getProductPriceInfo(product)
        );

        this.view.showDetailedProductList(products, priceInfos, 'Produtos com Preços Originais');
    }
}

// Executar a aplicação
const app = new App();
app.run();