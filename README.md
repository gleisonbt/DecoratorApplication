# Decorator Application

Uma aplicação TypeScript simples demonstrando conceitos básicos de programação orientada a objetos.

## 📋 Sobre o Projeto

Este projeto é uma estrutura básica em TypeScript que demonstra:
- Configuração de projeto TypeScript
- Modelos de dados (User)
- Serviços (UserService)
- Estrutura organizacional de código

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

## 📁 Estrutura do Projeto

```
src/
├── index.ts              # Arquivo principal da aplicação
├── models/
│   └── User.ts          # Modelo de dados do usuário
└── services/
    └── UserService.ts   # Serviço para gerenciamento de usuários
```

## 🛠️ Scripts Disponíveis

- `npm run build` - Compila o TypeScript para JavaScript
- `npm run start` - Executa a aplicação compilada
- `npm run dev` - Executa em modo desenvolvimento
- `npm run watch` - Compila automaticamente quando há mudanças
- `npm run clean` - Remove a pasta de build

## 📦 Dependências

### Desenvolvimento
- TypeScript
- ts-node (para execução em desenvolvimento)
- @types/node (tipos do Node.js)
- rimraf (para limpeza de arquivos)

## 🔧 Configuração

- `tsconfig.json` - Configuração do TypeScript
- `package.json` - Configuração do projeto e dependências

## 📝 Funcionalidades

- ✅ Criação de usuários
- ✅ Validação de email
- ✅ Gerenciamento de usuários (CRUD básico)
- ✅ Busca por ID e email
- ✅ Contagem de usuários

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.