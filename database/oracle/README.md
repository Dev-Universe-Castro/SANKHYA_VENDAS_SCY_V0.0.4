# Scripts Oracle - Gestão de Empresas

## ⚠️ NOTA IMPORTANTE

Este projeto usa **PostgreSQL (Neon)** para gerenciamento de empresas e configurações via Drizzle ORM.

O **Oracle Database** é usado para espelhamento de dados do Sankhya através das tabelas AS_*.

A sincronização é feita automaticamente via Node.js usando o pacote `oracledb`.

## Estrutura do Banco de Dados Atual (PostgreSQL)

O sistema utiliza as seguintes tabelas no PostgreSQL:

### USERS

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR | Identificador único (UUID) |
| email | TEXT | Email do usuário (único) |
| password | TEXT | Senha criptografada (bcrypt) |
| nome | TEXT | Nome do usuário |
| perfil | TEXT | Perfil (ADM, USER) |

### EMPRESAS

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR | Identificador único (UUID) |
| nome | TEXT | Nome da empresa |
| ativo | BOOLEAN | Se a empresa está ativa |
| ultima_sync | TIMESTAMP | Última sincronização |
| sankhya_endpoint | TEXT | URL da API Sankhya |
| sankhya_app_key | TEXT | App Key do Sankhya |
| sankhya_username | TEXT | Usuário Sankhya |
| sankhya_password_encrypted | TEXT | Senha criptografada (AES-256) |
| created_at | TIMESTAMP | Data de criação |

### SYNC_LOGS

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR | Identificador único (UUID) |
| empresa_id | VARCHAR | ID da empresa |
| tipo | TEXT | Tipo de sincronização |
| status | TEXT | Status da sincronização |
| duracao | TEXT | Tempo de execução |
| detalhes | TEXT | Detalhes da operação |
| erro | TEXT | Mensagem de erro (se houver) |
| timestamp | TIMESTAMP | Data/hora da operação |

### CONFIGURACOES

| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | VARCHAR | Identificador único (UUID) |
| chave | TEXT | Chave da configuração (única) |
| valor | TEXT | Valor da configuração (JSON) |
| updated_at | TIMESTAMP | Última atualização |

## Configuração do Banco de Dados

O sistema utiliza PostgreSQL via Neon Database. Configure a variável de ambiente:

```bash
DATABASE_URL="postgresql://user:password@host/database"
```

## Inicialização

1. Execute as migrações do Drizzle:
```bash
npm run db:push
```

2. Execute o seed para criar usuário admin:
```bash
npm run db:seed
```

3. Inicie o servidor:
```bash
npm run dev
```

## Credenciais de Acesso Padrão

- **Email**: admin@sistema.com
- **Senha**: admin123

## Estrutura do Projeto

```
server/
├── db.ts           # Configuração Drizzle + Neon
├── seed.ts         # Script de seed inicial
├── routes.ts       # Rotas da API
├── auth.ts         # Autenticação JWT
├── crypto.ts       # Criptografia AES-256
└── storage.ts      # Interface de acesso aos dados

shared/
└── schema.ts       # Schema Drizzle (tabelas)
```

## API Endpoints

### Autenticação
- `POST /api/login` - Login
- `POST /api/register` - Registro
- `GET /api/user` - Usuário atual

### Empresas
- `GET /api/empresas` - Listar empresas
- `GET /api/empresas/:id` - Obter empresa
- `POST /api/empresas` - Criar empresa
- `PUT /api/empresas/:id` - Atualizar empresa
- `DELETE /api/empresas/:id` - Deletar empresa

### Sincronização
- `POST /api/sincronizar/:empresa_id` - Sincronizar empresa
- `POST /api/sincronizar/:empresa_id/testar` - Testar conexão

### Logs
- `GET /api/logs` - Listar logs
- `GET /api/logs/:id` - Obter log

### Configurações
- `GET /api/configuracoes` - Listar configurações
- `POST /api/configuracoes` - Criar/Atualizar configuração