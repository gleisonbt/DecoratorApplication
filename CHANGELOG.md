# CHANGELOG

## [1.0.0] - 2025-09-30

### Added
- Estrutura inicial do projeto TypeScript
- Enum `Category` com valores: eletronicos, livros, alimentos
- Interface `PriceCalc` para cálculo de preços
- Classe abstrata `PriceDecorator` implementando padrão Decorator
- Modelos:
  - `User` - Modelo de usuário com validação
  - `Product` - Modelo de produto com name, category e price
  - `Category` - Enum e utilitários para categorias
- Serviços:
  - `UserService` - Gerenciamento CRUD de usuários
  - `PriceCalculators` - Implementações do padrão Decorator
- Decorators implementados:
  - `BasicPrice` - Preço básico sem modificações
  - `CategoryPercentOff` - Desconto percentual por categoria específica
  - `CouponPercentOff` - Desconto percentual universal com cupom
- Configuração completa do TypeScript
- Scripts npm para desenvolvimento e build
- Documentação completa no README.md
- Gitignore configurado para projetos Node.js/TypeScript

### Features
- ✅ Padrão Decorator para cálculo de preços
- ✅ Sistema de categorias com enum
- ✅ Validação de dados
- ✅ Estrutura modular e extensível
- ✅ Exemplos práticos de uso
- ✅ TypeScript com configuração otimizada