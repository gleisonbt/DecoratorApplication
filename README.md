# Decorator Application

Uma aplicação TypeScript demonstrando arquitetura MVC e padrão Decorator para gerenciamento de produtos com sistema de descontos.

## 📋 Sobre o Projeto

Este projeto demonstra:
- **Arquitetura MVC** (Model-View-Controller)
- **Padrão Decorator** para cálculo de preços e descontos
- **TypeScript** com tipagem forte
- **Gerenciamento de produtos** com categorias
- **Sistema de descontos** flexível e extensível

## 🏗️ Arquitetura MVC

### 📁 Estrutura do Projeto

```
src/
├── app.ts                    # Aplicação principal
├── controllers/
│   └── ProductController.ts  # Controller (lógica de controle)
├── models/
│   ├── Category.ts          # Enum e utilitários de categoria
│   ├── PriceCalc.ts         # Interface para cálculo de preços
│   └── Product.ts           # Modelo de produto
├── services/
│   ├── PriceCalculators.ts  # Implementações do padrão Decorator
│   └── ProductService.ts    # Serviço de produtos (camada de dados)
└── views/
    └── ProductView.ts       # View (interface de usuário)
```

### 🔧 Componentes MVC

- **Model**: `Product`, `Category`, `PriceCalc` - Representam os dados
- **View**: `ProductView` - Interface de usuário e exibição
- **Controller**: `ProductController` - Lógica de negócio e controle

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