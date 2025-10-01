const mysql = require('mysql2/promise');

/**
 * Configuração de conexão com MySQL via XAMPP
 */
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'decorator_products',
    charset: 'utf8mb4',
    timezone: '-03:00', // Horário de Brasília
    
    // Configurações de pool de conexões
    connectionLimit: 10,
    
    // Configurações de debug (desabilitar em produção)
    debug: false,
    multipleStatements: true
};

/**
 * Pool de conexões para melhor performance
 */
const pool = mysql.createPool(dbConfig);

/**
 * Classe para gerenciar conexões com o banco de dados
 */
class DatabaseManager {
    constructor() {
        this.pool = pool;
    }

    /**
     * Testa a conexão com o banco de dados
     */
    async testConnection() {
        try {
            const connection = await this.pool.getConnection();
            await connection.ping();
            connection.release();
            return { success: true, message: 'Conexão com banco de dados estabelecida!' };
        } catch (error) {
            return { 
                success: false, 
                message: 'Erro ao conectar com banco de dados',
                error: error.message 
            };
        }
    }

    /**
     * Executa uma query SELECT
     */
    async select(query, params = []) {
        try {
            const [rows] = await this.pool.execute(query, params);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro na consulta SELECT:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Executa uma query INSERT
     */
    async insert(query, params = []) {
        try {
            const [result] = await this.pool.execute(query, params);
            return { 
                success: true, 
                insertId: result.insertId,
                affectedRows: result.affectedRows 
            };
        } catch (error) {
            console.error('Erro na inserção:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Executa uma query UPDATE
     */
    async update(query, params = []) {
        try {
            const [result] = await this.pool.execute(query, params);
            return { 
                success: true, 
                affectedRows: result.affectedRows,
                changedRows: result.changedRows 
            };
        } catch (error) {
            console.error('Erro na atualização:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Executa uma query DELETE
     */
    async delete(query, params = []) {
        try {
            const [result] = await this.pool.execute(query, params);
            return { 
                success: true, 
                affectedRows: result.affectedRows 
            };
        } catch (error) {
            console.error('Erro na exclusão:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Executa uma transação
     */
    async transaction(operations) {
        const connection = await this.pool.getConnection();
        
        try {
            await connection.beginTransaction();
            
            const results = [];
            for (const operation of operations) {
                const [result] = await connection.execute(operation.query, operation.params || []);
                results.push(result);
            }
            
            await connection.commit();
            return { success: true, results };
            
        } catch (error) {
            await connection.rollback();
            console.error('Erro na transação:', error);
            return { success: false, error: error.message };
        } finally {
            connection.release();
        }
    }

    /**
     * Executa uma stored procedure
     */
    async callProcedure(procedureName, params = []) {
        try {
            const placeholders = params.map(() => '?').join(', ');
            const query = `CALL ${procedureName}(${placeholders})`;
            const [rows] = await this.pool.execute(query, params);
            return { success: true, data: rows };
        } catch (error) {
            console.error('Erro ao executar procedure:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Fecha o pool de conexões
     */
    async close() {
        try {
            await this.pool.end();
            console.log('Pool de conexões fechado.');
        } catch (error) {
            console.error('Erro ao fechar pool:', error);
        }
    }
}

/**
 * Instância singleton do gerenciador de banco
 */
const db = new DatabaseManager();

module.exports = {
    db,
    DatabaseManager,
    dbConfig
};