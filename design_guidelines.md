
# Central de Gerenciamento Sankhya-Oracle

## 🎯 Visão Geral

Sistema completo de gerenciamento e sincronização bidirecional entre ERP Sankhya e banco de dados. Centralize autenticações, monitore logs e configure políticas de sincronização.

## 🏗️ Arquitetura

### Stack Tecnológico

**Backend:**
- Node.js + TypeScript
- Express.js
- Drizzle ORM
- PostgreSQL (Neon Database)
- JWT Authentication
- AES-256 Encryption

**Frontend:**
- React 18
- TypeScript
- TanStack Query (React Query)
- Shadcn/ui + Tailwind CSS
- Recharts para gráficos

## 📁 Estrutura do Projeto

```
├── server/              # Backend Node.js
│   ├── db.ts           # Configuração Drizzle + Neon
│   ├── routes.ts       # Rotas da API
│   ├── auth.ts         # Autenticação JWT
│   ├── crypto.ts       # Criptografia de senhas
│   ├── seed.ts         # Seed do banco
│   └── index.ts        # Entry point
├── client/             # Frontend React
│   └── src/
│       ├── pages/      # Páginas da aplicação
│       ├── components/ # Componentes reutilizáveis
│       └── lib/        # Utilitários
├── shared/             # Código compartilhado
│   └── schema.ts       # Schema Drizzle
└── database/           # Documentação Oracle (referência)
```

## 🚀 Início Rápido

### 1. Configurar Variáveis de Ambiente

O Replit já configura automaticamente o `DATABASE_URL` quando você provisiona um banco PostgreSQL.

### 2. Instalar Dependências

```bash
npm install
```

### 3. Inicializar Banco de Dados

```bash
npm run db:push    # Criar tabelas
npm run db:seed    # Criar usuário admin
```

### 4. Iniciar Aplicação

```bash
npm run dev
```

Acesse: http://localhost:5000

**Credenciais padrão:**
- Email: admin@sistema.com
- Senha: admin123

## 🔐 Segurança

- Senhas criptografadas com bcrypt (10 rounds)
- Tokens JWT com expiração de 7 dias
- Credenciais Sankhya criptografadas com AES-256
- Headers de segurança configurados

## 📊 Funcionalidades

### Gestão de Empresas
- CRUD completo de empresas
- Configuração de credenciais Sankhya
- Ativação/desativação de empresas
- Teste de conexão com API

### Sincronização
- Sincronização manual por empresa
- Teste de conexão antes de sincronizar
- Logs detalhados de cada operação
- Retry automático em caso de falha

### Monitoramento
- Dashboard com métricas em tempo real
- Logs de sincronização filtráveis
- Visualização de erros e sucessos
- Estatísticas de performance

### Configurações
- Políticas de sincronização
- Intervalos de retry
- Timeout de requisições
- Credenciais globais

## 🔌 API Endpoints

### Autenticação
```
POST /api/login
POST /api/register
GET  /api/user
```

### Empresas
```
GET    /api/empresas
GET    /api/empresas/:id
POST   /api/empresas
PUT    /api/empresas/:id
DELETE /api/empresas/:id
```

### Sincronização
```
POST /api/sincronizar/:empresa_id
POST /api/sincronizar/:empresa_id/testar
```

### Logs
```
GET /api/logs
GET /api/logs/:id
```

### Configurações
```
GET  /api/configuracoes
POST /api/configuracoes
PUT  /api/configuracoes/:chave
```

## 🎨 Design System

O sistema utiliza Shadcn/ui com tema personalizado:

**Cores:**
- Primary: Blue (#0066CC)
- Success: Green (#10B981)
- Warning: Yellow (#F59E0B)
- Error: Red (#EF4444)

**Componentes:**
- Sidebar responsivo
- Cards com métricas
- Tabelas com paginação
- Formulários validados
- Badges de status
- Gráficos interativos

## 📝 Convenções de Código

- TypeScript strict mode
- ESLint + Prettier
- Componentes funcionais com hooks
- Async/await para operações assíncronas
- Error boundaries para tratamento de erros

## 🔄 Fluxo de Sincronização

1. Usuário seleciona empresa
2. Sistema testa conexão com Sankhya
3. Autentica e obtém token Bearer
4. Carrega dados via CRUDServiceProvider
5. Processa e armazena no PostgreSQL
6. Registra log de operação
7. Atualiza última sincronização

## 📦 Deploy

O projeto está pronto para deploy no Replit:

1. Configure as variáveis de ambiente
2. Provisione um banco PostgreSQL
3. Execute `npm run db:push`
4. Execute `npm run db:seed`
5. Clique em "Run"

## 🛠️ Comandos Úteis

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run db:push      # Aplicar schema
npm run db:seed      # Seed inicial
npm run db:studio    # Drizzle Studio (GUI)
```

## 📚 Documentação Adicional

- [Drizzle ORM](https://orm.drizzle.team)
- [Shadcn/ui](https://ui.shadcn.com)
- [TanStack Query](https://tanstack.com/query)
- [Express.js](https://expressjs.com)
