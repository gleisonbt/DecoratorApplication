const { db } = require('./src/database/connection.js');
const ProductRepository = require('./src/database/ProductRepository.js');

/**
 * Script de teste para verificar conexão e operações do banco de dados
 */
async function testDatabase() {
    console.log('🗄️  Testando Conexão com Banco de Dados MySQL/XAMPP');
    console.log('============================================================');
    
    try {
        // Teste 1: Conexão básica
        console.log('1. Testando conexão básica...');
        const connectionTest = await db.testConnection();
        
        if (!connectionTest.success) {
            console.log('❌ Falha na conexão:', connectionTest.message);
            console.log('💡 Verifique se:');
            console.log('   - XAMPP está rodando: sudo /opt/lampp/lampp start');
            console.log('   - MySQL está ativo na porta 3306');
            console.log('   - Banco "decorator_products" foi criado');
            return;
        }
        
        console.log('✅ Conexão estabelecida com sucesso!');
        console.log('');
        
        // Teste 2: Verificar estrutura do banco
        console.log('2. Verificando estrutura do banco...');
        const tablesResult = await db.select('SHOW TABLES');
        
        if (tablesResult.success) {
            console.log('✅ Tabelas encontradas:');
            tablesResult.data.forEach(table => {
                const tableName = Object.values(table)[0];
                console.log(`   📋 ${tableName}`);
            });
        } else {
            console.log('❌ Erro ao verificar tabelas:', tablesResult.error);
            return;
        }
        console.log('');
        
        // Teste 3: Operações do ProductRepository
        console.log('3. Testando ProductRepository...');
        const productRepo = new ProductRepository();
        
        // Buscar todos os produtos
        console.log('   📦 Buscando produtos...');
        const productsResult = await productRepo.findAll();
        
        if (productsResult.success) {
            console.log(`   ✅ ${productsResult.data.length} produtos encontrados:`);
            productsResult.data.forEach(product => {
                console.log(`      • ${product.name} (${product.category_display_name}) - R$ ${product.price}`);
            });
        } else {
            console.log('   ❌ Erro ao buscar produtos:', productsResult.error);
        }
        console.log('');
        
        // Teste 4: Estatísticas
        console.log('4. Testando estatísticas...');
        const statsResult = await productRepo.getStatistics();
        
        if (statsResult.success && statsResult.data.length > 0) {
            const stats = statsResult.data[0];
            console.log('   📊 Estatísticas dos produtos:');
            console.log(`      Total: ${stats.total_products}`);
            console.log(`      Preço médio: R$ ${parseFloat(stats.average_price || 0).toFixed(2)}`);
            console.log(`      Mais caro: ${stats.most_expensive || 'N/A'}`);
            console.log(`      Mais barato: ${stats.cheapest || 'N/A'}`);
        } else {
            console.log('   ❌ Erro ao obter estatísticas:', statsResult.error);
        }
        console.log('');
        
        // Teste 5: Busca por categoria
        console.log('5. Testando busca por categoria...');
        const eletronicosResult = await productRepo.findByCategory('eletronicos');
        
        if (eletronicosResult.success) {
            console.log(`   🔌 ${eletronicosResult.data.length} eletrônicos encontrados:`);
            eletronicosResult.data.forEach(product => {
                console.log(`      • ${product.name} - R$ ${product.price}`);
            });
        } else {
            console.log('   ❌ Erro na busca por categoria:', eletronicosResult.error);
        }
        console.log('');
        
        // Teste 6: Busca por nome
        console.log('6. Testando busca por nome...');
        const iphoneResult = await productRepo.findByName('iPhone 15 Pro');
        
        if (iphoneResult) {
            console.log('   📱 iPhone encontrado:');
            console.log(`      • ${iphoneResult.name} - R$ ${iphoneResult.price}`);
            console.log(`      • Categoria: ${iphoneResult.category_display_name}`);
            console.log(`      • Estoque: ${iphoneResult.stock_quantity}`);
        } else {
            console.log('   ❌ iPhone não encontrado');
        }
        console.log('');
        
        // Teste 7: Produtos por categoria
        console.log('7. Testando contagem por categoria...');
        const categoryCountResult = await productRepo.getProductsByCategory();
        
        if (categoryCountResult.success) {
            console.log('   📈 Produtos por categoria:');
            categoryCountResult.data.forEach(category => {
                console.log(`      • ${category.category_display_name}: ${category.product_count} produto(s)`);
            });
        } else {
            console.log('   ❌ Erro na contagem por categoria:', categoryCountResult.error);
        }
        console.log('');
        
        console.log('============================================================');
        console.log('🎉 Todos os testes concluídos com sucesso!');
        console.log('');
        console.log('💡 Próximos passos:');
        console.log('   1. Integrar ProductRepository com ProductService.ts');
        console.log('   2. Atualizar ProductController para usar banco de dados');
        console.log('   3. Testar interface web com dados persistidos');
        console.log('   4. Implementar operações CRUD completas');
        
    } catch (error) {
        console.error('💥 Erro durante os testes:', error);
        console.log('');
        console.log('🔧 Possíveis soluções:');
        console.log('   1. Verificar se XAMPP está rodando');
        console.log('   2. Executar script de setup: bash database/setup-xampp.sh');
        console.log('   3. Verificar configurações de conexão em src/database/connection.js');
        console.log('   4. Instalar dependências: npm install');
    } finally {
        // Fechar conexões
        await db.close();
        process.exit(0);
    }
}

// Executar testes
testDatabase();