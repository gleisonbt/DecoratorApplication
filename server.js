const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Servir arquivos estáticos da pasta public
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para JSON
app.use(express.json());

// Rota principal
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Endpoint para demonstrar a integração com o backend TypeScript
app.get('/api/status', (req, res) => {
    res.json({
        status: 'active',
        message: 'Sistema de Gerenciamento de Produtos está funcionando',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Algo deu errado!',
        message: err.message
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📱 Interface web disponível em http://localhost:${PORT}`);
    console.log(`🔧 Status da API: http://localhost:${PORT}/api/status`);
});

module.exports = app;