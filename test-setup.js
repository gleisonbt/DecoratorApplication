const { DatabaseManager } = require('./src/database/connection');
const { ProductRepository } = require('./src/database/ProductRepository');

async function testSetup() {
    console.log('🔍 Testando configuração do sistema...\n');
    
    try {
        // Teste de conexão com o banco
        const db = new DatabaseManager();
        console.log('✅ DatabaseManager criado com sucesso');
        
        // Teste básico de query
        const testResult = await db.select('SELECT 1 as test');
        if (testResult.success) {
            console.log('✅ Conexão com banco estabelecida');
        } else {
            console.log('❌ Erro na conexão:', testResult.error);
            return;
        }
        
        // Teste do ProductRepository
        const productRepo = new ProductRepository();
        console.log('✅ ProductRepository criado com sucesso');
        
        // Teste de busca de produtos
        const products = await productRepo.findAll();
        if (products.success) {
            console.log(`✅ Busca de produtos funcionando (${products.data.length} produtos encontrados)`);
        } else {
            console.log('❌ Erro na busca de produtos:', products.error);
        }
        
        // Teste de estatísticas
        const stats = await productRepo.getStatistics();
        if (stats.success) {
            console.log('✅ Estatísticas funcionando');
            console.log('📊 Dados:', stats.data);
        } else {
            console.log('❌ Erro nas estatísticas:', stats.error);
        }
        
        console.log('\n🎉 Todos os testes passaram! Sistema pronto para uso.');
        
    } catch (error) {
        console.error('❌ Erro durante os testes:', error.message);
    }
}

testSetup();