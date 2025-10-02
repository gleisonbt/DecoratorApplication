# Decorator Application - Sistema Web de Gerenciamento de Produtos

Uma aplicação web TypeScript demonstrando arquitetura MVC, padrão Decorator e integração com MySQL para gerenciamento de produtos com sistema de descontos.

## 📋 Sobre o Projeto

Este projeto demonstra:
- **Interface Web Moderna** com design responsivo
- **Arquitetura MVC** (Model-View-Controller)
- **Padrão Decorator** para cálculo de preços e descontos
- **TypeScript** com tipagem forte
- **Integração MySQL** para persistência de dados
- **API REST** com Express.js
- **Sistema de descontos** flexível e extensível

## 🌐 Interface Web

A aplicação possui uma interface web moderna com:
- **Dashboard interativo** para gerenciamento de produtos
- **Sistema de descontos visuais** com badges e post-its
- **Formulários responsivos** para CRUD de produtos
- **Filtros e busca** em tempo real
- **Estatísticas e métricas** visuais

## 🏗️ Arquitetura

### 📁 Estrutura do Projeto

```
├── public/                   # Interface web
│   ├── index.html           # Página principal
│   ├── app.js               # Lógica frontend
│   └── styles-clean.css     # Estilos modernos
├── server.js                # Servidor Express.js
├── src/
│   ├── controllers/
│   │   └── ProductControllerDB.ts  # Controller com MySQL
│   ├── models/
│   │   ├── Product.ts              # Modelo Product
│   │   └── PriceCalc.ts            # Interface para decorators
│   ├── services/
│   │   ├── ProductServiceDB.ts     # Service com banco de dados
│   │   └── PriceCalculators.ts     # Implementações do Decorator
│   └── database/
│       └── connection.ts           # Conexão MySQL
```

### 🔧 Componentes

- **Frontend**: Interface web moderna com JavaScript vanilla
- **Backend**: API REST com Express.js e TypeScript
- **Database**: MySQL para persistência
- **Decorators**: Sistema flexível de cálculo de preços

## 🎯 Padrão Decorator

O sistema implementa o padrão Decorator para cálculo de preços:

- **`BasicPrice`** - Calculador básico (preço original)
- **`CategoryPercentOff`** - Desconto condicional por categoria
- **`CouponPercentOff`** - Desconto universal com cupom

### 💡 Exemplo de Uso:
```typescript
// Preço básico
const basicCalc = new BasicPrice();

// Desconto de 10% para eletrônicos
const categoryDiscount = new CategoryPercentOff(basicCalc, Category.ELETRONICOS, 0.10);

// Cupom adicional de 5%
const withCoupon = new CouponPercentOff(categoryDiscount, 0.05);

// Cálculo final
const finalPrice = withCoupon.total(product);
```

## 🚀 Como Executar

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn

### Instalação

1. Clone o repositório
2. Instale as dependências:
```bash
npm install
```

### Executando o Projeto

#### Modo Desenvolvimento (com ts-node)
```bash
npm run dev
```

#### Build e Execução
```bash
npm run build
npm start
```

#### Modo Watch (desenvolvimento)
```bash
npm run watch
```

## 📦 Funcionalidades

### 🛍️ Gerenciamento de Produtos
- ✅ Cadastro de produtos
- ✅ Listagem e busca
- ✅ Remoção de produtos
- ✅ Categorização (Eletrônicos, Livros, Alimentos)

### 💰 Sistema de Descontos
- ✅ Desconto por categoria específica
- ✅ Cupons de desconto universais
- ✅ Combinação de múltiplos descontos
- ✅ Cálculo automático de preços finais

### 📊 Relatórios e Estatísticas
- ✅ Estatísticas de produtos
- ✅ Produtos por categoria
- ✅ Preços médios
- ✅ Produto mais caro/barato

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.