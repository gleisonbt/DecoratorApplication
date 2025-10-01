#!/bin/bash

# ============================================================
# SCRIPT DE CONFIGURAÇÃO DO BANCO DE DADOS - XAMPP
# Sistema de Gerenciamento de Produtos
# ============================================================

echo "🗄️  Configurando Banco de Dados MySQL no XAMPP..."
echo "============================================================"

# Variáveis de configuração
XAMPP_PATH="/opt/lampp"
MYSQL_PATH="$XAMPP_PATH/bin/mysql"
DB_NAME="decorator_products"
DB_USER="root"
DB_PASSWORD=""
SCRIPT_PATH="$(pwd)/database/schema.sql"

# Verificar se XAMPP está instalado
if [ ! -d "$XAMPP_PATH" ]; then
    echo "❌ XAMPP não encontrado em $XAMPP_PATH"
    echo "💡 Por favor, instale o XAMPP primeiro:"
    echo "   sudo apt update"
    echo "   wget https://www.apachefriends.org/xampp-files/8.2.12/xampp-linux-x64-8.2.12-0-installer.run"
    echo "   chmod +x xampp-linux-x64-8.2.12-0-installer.run"
    echo "   sudo ./xampp-linux-x64-8.2.12-0-installer.run"
    exit 1
fi

# Verificar se MySQL está rodando
echo "🔍 Verificando status do MySQL..."
if ! $XAMPP_PATH/bin/mysqladmin -u$DB_USER ping > /dev/null 2>&1; then
    echo "⚠️  MySQL não está rodando. Iniciando XAMPP..."
    sudo $XAMPP_PATH/lampp start
    
    # Aguardar MySQL iniciar
    echo "⏳ Aguardando MySQL inicializar..."
    sleep 5
    
    # Verificar novamente
    if ! $XAMPP_PATH/bin/mysqladmin -u$DB_USER ping > /dev/null 2>&1; then
        echo "❌ Falha ao iniciar MySQL. Verifique a instalação do XAMPP."
        exit 1
    fi
fi

echo "✅ MySQL está rodando!"

# Verificar se o arquivo SQL existe
if [ ! -f "$SCRIPT_PATH" ]; then
    echo "❌ Arquivo schema.sql não encontrado em: $SCRIPT_PATH"
    echo "💡 Certifique-se de que o arquivo foi criado corretamente."
    exit 1
fi

# Executar script SQL
echo "📁 Executando script de criação do banco de dados..."
echo "🔧 Arquivo: $SCRIPT_PATH"

if $MYSQL_PATH -u$DB_USER -p$DB_PASSWORD < "$SCRIPT_PATH"; then
    echo "✅ Banco de dados criado com sucesso!"
    echo ""
    echo "📊 Verificando estrutura criada..."
    
    # Mostrar tabelas criadas
    $MYSQL_PATH -u$DB_USER -p$DB_PASSWORD -e "USE $DB_NAME; SHOW TABLES;" 2>/dev/null
    
    echo ""
    echo "📈 Estatísticas iniciais:"
    $MYSQL_PATH -u$DB_USER -p$DB_PASSWORD -e "
        USE $DB_NAME; 
        SELECT 
            (SELECT COUNT(*) FROM products) as 'Produtos',
            (SELECT COUNT(*) FROM categories) as 'Categorias', 
            (SELECT COUNT(*) FROM discounts) as 'Descontos';
    " 2>/dev/null
    
else
    echo "❌ Erro ao executar script SQL!"
    echo "💡 Verifique os logs de erro do MySQL em: $XAMPP_PATH/logs/"
    exit 1
fi

echo ""
echo "============================================================"
echo "🎉 Configuração concluída com sucesso!"
echo ""
echo "📋 Informações de conexão:"
echo "   Host: localhost"
echo "   Porta: 3306"
echo "   Banco: $DB_NAME"
echo "   Usuário: $DB_USER"
echo "   Senha: (vazia)"
echo ""
echo "🌐 Acesse o phpMyAdmin em: http://localhost/phpmyadmin"
echo ""
echo "💻 Para conectar na aplicação Node.js, use:"
echo "   npm install mysql2"
echo "   Host: 'localhost'"
echo "   User: 'root'"
echo "   Password: ''"
echo "   Database: '$DB_NAME'"
echo "============================================================"