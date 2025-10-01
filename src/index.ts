import { User } from './models/User';
import { UserService } from './services/UserService';
import { Category, CategoryUtils } from './models/Category';
import { Product } from './models/Product';
import { PriceCalc } from './models/PriceCalc';
import { 
    BasicPrice, 
    PriceDecorator, 
    CategoryPercentOff, 
    CouponPercentOff
} from './services/PriceCalculators';

// Função principal da aplicação
function main(): void {
    console.log('🚀 Aplicação TypeScript iniciada!');
    
    // Criando uma instância do serviço de usuário
    const userService = new UserService();
    
    // Criando um novo usuário
    const user = new User(1, 'João Silva', 'joao@email.com');
    
    // Adicionando o usuário
    userService.addUser(user);
    
    // Listando todos os usuários
    console.log('📋 Usuários cadastrados:');
    const users = userService.getAllUsers();
    users.forEach(u => console.log(`- ${u.name} (${u.email})`));
    
    // Buscando um usuário por ID
    const foundUser = userService.getUserById(1);
    if (foundUser) {
        console.log(`🔍 Usuário encontrado: ${foundUser.name}`);
    }

    // Demonstrando o uso da enum Category
    console.log('\n📦 Demonstração da enum Category:');
    
    // Listando todas as categorias
    const allCategories = CategoryUtils.getAllCategories();
    console.log('Categorias disponíveis:');
    allCategories.forEach(category => {
        console.log(`- ${CategoryUtils.getDisplayName(category)} (${category})`);
    });

    // Usando as categorias
    console.log(`\n🛒 Exemplo de uso das categorias:`);
    console.log(`Categoria selecionada: ${CategoryUtils.getDisplayName(Category.ELETRONICOS)}`);
    console.log(`Valor da enum: ${Category.LIVROS}`);
    
    // Validação de categoria
    try {
        const validCategory = CategoryUtils.fromString('livros');
        console.log(`✅ Categoria válida: ${CategoryUtils.getDisplayName(validCategory)}`);
    } catch (error) {
        console.log(`❌ Erro: ${error}`);
    }

    // Demonstrando o uso de produtos com categorias
    console.log('\n🛍️ Exemplo de produtos com categorias:');
    
    const products = [
        new Product('Smartphone Samsung', Category.ELETRONICOS, 1200.00),
        new Product('O Senhor dos Anéis', Category.LIVROS, 45.90),
        new Product('Arroz Integral', Category.ALIMENTOS, 8.50)
    ];

    products.forEach(product => {
        console.log('\n' + product.getProductInfo());
    });

    // Demonstrando o uso da interface PriceCalc com o padrão Decorator
    console.log('\n💰 Demonstração do padrão Decorator com PriceCalc:');
    
    const testProduct = new Product('Notebook Dell', Category.ELETRONICOS, 2500.00);
    
    // Calculador básico
    const basicCalc = new BasicPrice();
    
    // Aplicando decorators de forma incremental
    const withDiscount = new CategoryPercentOff(basicCalc, Category.ELETRONICOS, 0.05); // 5% desconto em eletrônicos
    const withCoupon = new CouponPercentOff(withDiscount, 0.10); // 10% de desconto com cupom
    
    // Diferentes combinações usando o padrão Decorator
    const calculators: { name: string, calc: PriceCalc }[] = [
        { name: 'Preço Básico', calc: basicCalc },
        { name: '5% Off Eletrônicos', calc: withDiscount },
        { name: '5% Off + Cupom 10%', calc: withCoupon },
        { name: '10% Off Livros', calc: new CategoryPercentOff(basicCalc, Category.LIVROS, 0.10) },
        { name: 'Apenas Cupom (15%)', calc: new CouponPercentOff(basicCalc, 0.15) }
    ];

    console.log(`\n📱 Produto: ${testProduct.name} - Categoria: ${testProduct.category}`);
    console.log(`💵 Preço original: R$ ${testProduct.price.toFixed(2)}`);
    console.log('\n🧮 Diferentes combinações de decorators:');
    
    calculators.forEach(({ name, calc }) => {
        const total = calc.total(testProduct);
        console.log(`  ${name}: R$ ${total.toFixed(2)}`);
    });

    // Demonstrando CategoryPercentOff com diferentes categorias
    console.log('\n🎯 Demonstração do CategoryPercentOff com diferentes produtos:');
    
    const testProducts = [
        new Product('Smartphone Samsung', Category.ELETRONICOS, 1200.00),
        new Product('O Senhor dos Anéis', Category.LIVROS, 45.90),
        new Product('Arroz Integral', Category.ALIMENTOS, 8.50)
    ];

    const discountEletronicos = new CategoryPercentOff(basicCalc, Category.ELETRONICOS, 0.15); // 15% off eletrônicos
    
    testProducts.forEach(product => {
        const originalPrice = basicCalc.total(product);
        const discountedPrice = discountEletronicos.total(product);
        const hasDiscount = originalPrice !== discountedPrice;
        
        console.log(`\n📦 ${product.name} (${product.category})`);
        console.log(`  💰 Preço original: R$ ${originalPrice.toFixed(2)}`);
        console.log(`  🎯 Com desconto 15% eletrônicos: R$ ${discountedPrice.toFixed(2)} ${hasDiscount ? '✅ Desconto aplicado!' : '❌ Sem desconto'}`);
    });
}

// Executar a aplicação
main();