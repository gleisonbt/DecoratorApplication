# Sistema de Gerenciamento de Produtos 🛍️

Uma aplicação completa em TypeScript que demonstra arquitetura MVC, padrão Decorator e interface web moderna seguindo as heurísticas de usabilidade de Nielsen.

## 🚀 Funcionalidades

### Interface Web
- **Interface moderna e responsiva** com HTML5, CSS3 e JavaScript ES6+
- **Sistema de navegação intuitivo** com três seções principais
- **Feedback visual em tempo real** com toast notifications
- **Validação robusta** com prevenção de erros
- **Atalhos de teclado** para usuários avançados
- **Acessibilidade** seguindo padrões WCAG

### Gerenciamento de Produtos
- ✅ Adicionar produtos com nome, categoria e preço
- ✅ Editar produtos existentes
- ✅ Remover produtos com confirmação
- ✅ Filtrar por categoria e busca textual
- ✅ Visualização em cards responsivos

### Sistema de Descontos (Padrão Decorator)
- 🏷️ **Desconto por categoria**: Aplicar percentual específico por categoria
- 🎫 **Cupom de desconto**: Aplicar percentual global a todos os produtos
- 📊 **Visualização de economia**: Mostra preço original, final e economia
- 🔄 **Gestão flexível**: Adicionar/remover descontos dinamicamente

### Estatísticas e Relatórios
- 📈 Total de produtos cadastrados
- 💰 Preço médio dos produtos
- 📊 Gráfico de distribuição por categoria
- 🏆 Produto mais caro e mais barato

## 🎨 Heurísticas de Nielsen Implementadas

1. **Visibilidade do status do sistema**: Loading states e feedback visual
2. **Correspondência sistema-mundo real**: Linguagem natural e metáforas familiares
3. **Controle e liberdade do usuário**: Navegação livre e operações reversíveis
4. **Consistência e padrões**: Design system uniforme e comportamentos previsíveis
5. **Prevenção de erros**: Validações em tempo real e mensagens claras
6. **Reconhecimento vs memorização**: Interface autoexplicativa e contexto visível
7. **Flexibilidade e eficiência**: Atalhos de teclado e operações rápidas
8. **Design estético e minimalista**: Interface limpa e focada
9. **Recuperação de erros**: Mensagens de erro claras e sugestões de correção
10. **Ajuda e documentação**: Tooltips e feedback contextual

## 🏗️ Arquitetura

### Backend (TypeScript)
```
src/
├── app.ts                 # Aplicação principal
├── controllers/           # Controladores MVC
├── models/               # Modelos de dados
├── services/             # Lógica de negócio
└── views/                # Views (console)
```

### Frontend (Web)
```
public/
├── index.html            # Interface principal
├── styles.css            # Design system completo
└── app.js               # Lógica da aplicação web
```

## 🛠️ Tecnologias

- **Backend**: TypeScript, Node.js, Express.js
- **Frontend**: HTML5, CSS3, JavaScript ES6+
- **Padrões**: MVC, Decorator, Observer
- **Ferramentas**: Git, npm, TypeScript Compiler

## 📦 Instalação

1. Clone o repositório:
```bash
git clone <seu-repositorio>
cd DecoratorApplication
```

2. Instale as dependências:
```bash
npm install
```

3. Execute a aplicação web:
```bash
npm run web
```

4. Acesse no navegador:
```
http://localhost:3000
```

## 💻 Comandos Disponíveis

```bash
# Executar interface web
npm run web

# Executar versão console
npm run console

# Build do TypeScript
npm run build

# Desenvolvimento com watch
npm run watch

# Limpar arquivos de build
npm run clean
```

## 🎮 Como Usar

### Interface Web
1. **Produtos**: Gerencie seu catálogo de produtos
   - Clique em "Adicionar" para criar novos produtos
   - Use os filtros para encontrar produtos específicos
   - Edite ou remova produtos existentes

2. **Descontos**: Configure promoções flexíveis
   - Aplique descontos por categoria
   - Use cupons globais
   - Visualize economias em tempo real

3. **Estatísticas**: Acompanhe métricas importantes
   - Veja distribuição por categoria
   - Monitore preços médios
   - Identifique produtos extremos

### Atalhos de Teclado
- `Ctrl/Cmd + N`: Adicionar novo produto
- `Ctrl/Cmd + F`: Focar na busca
- `Esc`: Fechar modais

## 🔧 Estrutura do Código

### Padrão Decorator
O sistema implementa o padrão Decorator para aplicação flexível de descontos:

```typescript
// Decoradores de preço
BasicPrice -> Preço base do produto
CategoryPercentOff -> Desconto por categoria
CouponPercentOff -> Cupom de desconto
```

### Arquitetura MVC
- **Model**: `Product`, `Category`, `PriceCalc`
- **View**: `ProductView` (console) + Interface Web
- **Controller**: `ProductController`
- **Service**: `ProductService`

## 🌟 Demonstração

O sistema vem com dados de exemplo pré-carregados:
- Eletrônicos: iPhone 15 Pro, Samsung Galaxy S24
- Livros: O Hobbit, Clean Code
- Alimentos: Arroz Integral, Azeite Extra Virgem

## 📱 Responsividade

A interface se adapta automaticamente a diferentes tamanhos de tela:
- **Desktop**: Layout completo com sidebar
- **Tablet**: Interface adaptada
- **Mobile**: Design mobile-first

## 🎯 Próximos Passos

- [ ] Integração com banco de dados
- [ ] Autenticação de usuários
- [ ] Relatórios avançados
- [ ] API REST completa
- [ ] Testes automatizados
- [ ] PWA (Progressive Web App)

## 📄 Licença

MIT License - veja o arquivo LICENSE para detalhes.

---

**Desenvolvido com ❤️ usando TypeScript e seguindo as melhores práticas de UX/UI**