# CHANGELOG

## [2.0.0] - 2025-10-01

### Changed
- **BREAKING CHANGE**: Reestruturado para arquitetura MVC
- Removidos arquivos: `index.ts`, `User.ts`, `UserService.ts`
- Aplicação agora foca em gerenciamento de produtos

### Added
- **Arquitetura MVC completa**:
  - `ProductController.ts` - Controller para lógica de negócio
  - `ProductService.ts` - Serviço para gerenciamento de dados
  - `ProductView.ts` - Interface de usuário
- **Sistema completo de produtos**:
  - Cadastro, listagem, busca e remoção
  - Categorização por eletrônicos, livros e alimentos
  - Estatísticas e relatórios
- **Sistema avançado de descontos**:
  - Descontos por categoria específica
  - Cupons universais
  - Combinação de múltiplos descontos
  - Cálculo automático de economia
- **Demonstração interativa** com todos os recursos

### Features
- ✅ Arquitetura MVC bem estruturada
- ✅ Padrão Decorator para preços e descontos
- ✅ Sistema completo de gerenciamento de produtos
- ✅ Interface de usuário rica e informativa
- ✅ Cálculos automáticos de descontos
- ✅ Estatísticas detalhadas
- ✅ Busca e filtros por categoria

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