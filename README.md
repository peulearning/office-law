# FAAM — Sistema de Gestão do Escritório

> **Maria de Fátima Santos e Silva Ribeiro** | CNPJ 49.794.744/0001-14  
> Atividade principal: Cobrança e informações cadastrais (CNAE N-8291-1/00)  
> Januária — MG

Sistema web interno para gerenciamento de clientes, processos e despesas do escritório FAAM.

---

## Índice

1. [Visão geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Monorepo — estrutura de pastas](#monorepo--estrutura-de-pastas)
4. [Stack técnica](#stack-técnica)
5. [Modelagem de dados](#modelagem-de-dados)
6. [Plano MVP — fases](#plano-mvp--fases)
7. [Variáveis de ambiente](#variáveis-de-ambiente)
8. [Como rodar localmente](#como-rodar-localmente)
9. [Deploy](#deploy)
10. [Convenções e padrões](#convenções-e-padrões)

---

## Visão geral

O FAAM é um sistema multiusuário (~3 advogados) com as seguintes capacidades principais:

| Módulo | Descrição |
|---|---|
| **Autenticação** | Login com JWT, perfis Admin e Advogado |
| **Clientes** | Cadastro PF/PJ com validação CPF/CNPJ, histórico de alterações |
| **Processos** | Processos vinculados a clientes, controle de status e responsável |
| **Despesas** | Despesas vinculadas a cliente e/ou processo, upload de comprovantes |
| **Auditoria** | Log de todas as mudanças de status (quem/quando/antes/depois) |
| **Relatórios** | Dashboard + relatórios filtráveis por cliente, período e processo |

---

## Arquitetura

```
Navegador (desktop)
       │ HTTPS
       ▼
┌─────────────────────┐
│  Next.js 14          │  ← Vercel (free tier)
│  App Router + React  │
└────────┬────────────┘
         │ REST / JSON (JWT)
         ▼
┌─────────────────────┐       ┌──────────────────────┐
│  Spring Boot 3       │──────▶│  PostgreSQL 16        │
│  Java 21             │       │  Railway Managed DB   │
│  Spring Security     │       └──────────────────────┘
│  Spring Data JPA     │
│  Railway             │──────▶  Cloudflare R2
└─────────────────────┘         (PDFs e imagens)
```

**Decisões de design:**
- Frontend e backend são projetos **completamente separados** dentro do monorepo
- Comunicação exclusivamente via REST/JSON com autenticação JWT
- Banco de dados gerenciado pelo Railway com backups automáticos
- Arquivos (comprovantes) armazenados no Cloudflare R2 (S3-compatible, 10 GB gratuito)

---

## Monorepo — estrutura de pastas

```
faam/                              ← raiz do monorepo
├── apps/
│   ├── web/                       ← Frontend Next.js
│   │   ├── public/
│   │   ├── src/
│   │   │   ├── app/               ← App Router (Next.js 14)
│   │   │   │   ├── auth/          ← Tela de login
│   │   │   │   ├── dashboard/     ← Dashboard principal
│   │   │   │   ├── clientes/      ← CRUD de clientes
│   │   │   │   ├── processos/     ← CRUD de processos
│   │   │   │   ├── despesas/      ← CRUD de despesas + upload
│   │   │   │   └── relatorios/    ← Relatórios e exportações
│   │   │   ├── components/
│   │   │   │   ├── ui/            ← Componentes base (shadcn/ui)
│   │   │   │   └── layout/        ← Sidebar, Header, etc.
│   │   │   ├── hooks/             ← Custom hooks React
│   │   │   ├── lib/               ← Clientes HTTP, utils, formatters
│   │   │   └── types/             ← Tipos TypeScript compartilhados
│   │   ├── .env.local             ← Variáveis locais (não commitar)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── api/                       ← Backend Spring Boot
│       ├── src/
│       │   ├── main/
│       │   │   ├── java/br/com/faam/
│       │   │   │   ├── config/        ← SecurityConfig, CorsConfig, R2Config
│       │   │   │   ├── controller/    ← REST Controllers
│       │   │   │   ├── domain/
│       │   │   │   │   ├── entity/    ← Entidades JPA
│       │   │   │   │   └── enums/     ← Enums do domínio
│       │   │   │   ├── dto/
│       │   │   │   │   ├── request/   ← DTOs de entrada
│       │   │   │   │   └── response/  ← DTOs de saída
│       │   │   │   ├── exception/     ← Exceções customizadas + handler global
│       │   │   │   ├── repository/    ← Interfaces Spring Data JPA
│       │   │   │   ├── security/      ← JWT Filter, UserDetails, etc.
│       │   │   │   ├── service/       ← Regras de negócio
│       │   │   │   └── util/          ← Validadores CPF/CNPJ, formatters
│       │   │   └── resources/
│       │   │       ├── application.yml
│       │   │       └── db/migration/  ← Scripts Flyway (V1__, V2__, ...)
│       │   └── test/
│       ├── .env                   ← Variáveis locais (não commitar)
│       ├── pom.xml
│       └── Dockerfile
│
├── packages/
│   └── shared/                    ← Tipos e constantes compartilhados (futuro)
│
├── docs/
│   ├── architecture.md            ← Decisões de arquitetura (ADRs)
│   ├── api.md                     ← Documentação dos endpoints
│   └── data-model.md              ← ERD detalhado
│
├── .github/
│   └── workflows/
│       ├── api-ci.yml             ← CI do backend (build + testes)
│       └── web-ci.yml             ← CI do frontend (lint + build)
│
├── .gitignore
├── .editorconfig
└── README.md                      ← este arquivo
```

---

## Stack técnica

### Frontend (`apps/web`)

| Tecnologia | Versão | Motivo |
|---|---|---|
| Next.js | 14 (App Router) | SSR, rotas protegidas, deploy Vercel zero-config |
| React | 18 | Ecossistema, shadcn/ui |
| TypeScript | 5 | Segurança de tipos ponta-a-ponta |
| Tailwind CSS | 3 | Utilitários, manutenção simples |
| shadcn/ui | latest | Componentes acessíveis e customizáveis |
| React Hook Form | 7 | Formulários com validação performática |
| Zod | 3 | Validação de schemas no frontend |
| TanStack Query | 5 | Cache e sincronização de dados do servidor |
| Axios | latest | Cliente HTTP com interceptors para JWT |

### Backend (`apps/api`)

| Tecnologia | Versão | Motivo |
|---|---|---|
| Java | 21 (LTS) | Versão mais recente com suporte longo |
| Spring Boot | 3.3 | Framework principal, ecossistema maduro |
| Spring Security | 6 | Autenticação JWT integrada |
| Spring Data JPA | 3 | Abstração do banco com Hibernate |
| PostgreSQL Driver | latest | Banco relacional |
| Flyway | 10 | Migrations versionadas |
| jjwt (JJWT) | 0.12 | Geração e validação de tokens JWT |
| AWS SDK S3 | 2.x | Compatível com Cloudflare R2 (S3-compatible) |
| Lombok | latest | Redução de boilerplate |
| MapStruct | latest | Mapeamento entity ↔ DTO |
| SpringDoc OpenAPI | 2 | Documentação Swagger automática |

### Infraestrutura

| Serviço | Uso | Custo estimado |
|---|---|---|
| Vercel | Deploy do frontend | Gratuito |
| Railway | Deploy do backend + PostgreSQL | ~US$ 15–20/mês |
| Cloudflare R2 | Storage de arquivos | Gratuito até 10 GB |

---

## Modelagem de dados

### Entidades e relacionamentos

```
USERS (1) ──────────── (N) CLIENTES
USERS (1) ──────────── (N) PROCESSOS (responsavel_id)
USERS (1) ──────────── (N) DESPESAS
USERS (1) ──────────── (N) HISTORICO_STATUS

CLIENTES (1) ────────── (N) PROCESSOS
CLIENTES (1) ────────── (N) DESPESAS

PROCESSOS (1) ───────── (N) DESPESAS   ← processo_id é NULLABLE
DESPESAS (1) ────────── (N) ANEXOS
```

### Tabelas

#### `users`
| Campo | Tipo | Restrição |
|---|---|---|
| id | UUID | PK |
| nome | VARCHAR(150) | NOT NULL |
| email | VARCHAR(150) | UNIQUE, NOT NULL |
| senha_hash | VARCHAR(255) | NOT NULL |
| perfil | ENUM(ADMIN, ADVOGADO) | NOT NULL |
| ativo | BOOLEAN | DEFAULT true |
| criado_em | TIMESTAMP | NOT NULL |

#### `clientes`
| Campo | Tipo | Restrição |
|---|---|---|
| id | UUID | PK |
| nome_razao_social | VARCHAR(200) | NOT NULL |
| tipo_pessoa | ENUM(FISICA, JURIDICA) | NOT NULL |
| cpf_cnpj | VARCHAR(18) | UNIQUE, NOT NULL |
| telefone | VARCHAR(20) | |
| email | VARCHAR(150) | |
| logradouro | VARCHAR(200) | |
| numero | VARCHAR(10) | |
| complemento | VARCHAR(100) | |
| cidade | VARCHAR(100) | |
| uf | CHAR(2) | |
| cep | VARCHAR(9) | |
| observacoes | TEXT | |
| status | ENUM(ATIVO, INATIVO) | DEFAULT ATIVO |
| criado_por | UUID | FK → users |
| criado_em | TIMESTAMP | NOT NULL |
| atualizado_por | UUID | FK → users |
| atualizado_em | TIMESTAMP | |

#### `processos`
| Campo | Tipo | Restrição |
|---|---|---|
| id | UUID | PK |
| cliente_id | UUID | FK → clientes, NOT NULL |
| numero_processo | VARCHAR(50) | |
| orgao_vara_foro | VARCHAR(150) | |
| cidade | VARCHAR(100) | |
| uf | CHAR(2) | |
| tipo | VARCHAR(80) | |
| data_inicio | DATE | |
| data_encerramento | DATE | |
| status | ENUM(EM_ANDAMENTO, CONCLUIDO, ARQUIVADO, SUSPENSO) | DEFAULT EM_ANDAMENTO |
| responsavel_id | UUID | FK → users |
| observacoes | TEXT | |
| criado_por | UUID | FK → users |
| criado_em | TIMESTAMP | NOT NULL |
| atualizado_por | UUID | FK → users |
| atualizado_em | TIMESTAMP | |

#### `despesas`
| Campo | Tipo | Restrição |
|---|---|---|
| id | UUID | PK |
| cliente_id | UUID | FK → clientes, NOT NULL |
| processo_id | UUID | FK → processos, **NULLABLE** |
| descricao | VARCHAR(300) | NOT NULL |
| valor | DECIMAL(12,2) | NOT NULL |
| data_despesa | DATE | NOT NULL |
| tipo_despesa | ENUM(CUSTAS, HONORARIOS, TAXAS, TRANSPORTE, DILIGENCIAS, OUTROS) | NOT NULL |
| status_repasse | ENUM(PENDENTE, SOLICITADO, PAGO, CANCELADO) | DEFAULT PENDENTE |
| observacoes | TEXT | |
| criado_por | UUID | FK → users |
| criado_em | TIMESTAMP | NOT NULL |
| atualizado_por | UUID | FK → users |
| atualizado_em | TIMESTAMP | |

#### `anexos`
| Campo | Tipo | Restrição |
|---|---|---|
| id | UUID | PK |
| despesa_id | UUID | FK → despesas, NOT NULL |
| nome_arquivo | VARCHAR(255) | NOT NULL |
| url_storage | VARCHAR(512) | NOT NULL |
| mime_type | VARCHAR(100) | |
| tamanho_bytes | INTEGER | |
| enviado_por | UUID | FK → users |
| enviado_em | TIMESTAMP | NOT NULL |

#### `historico_status`
| Campo | Tipo | Restrição |
|---|---|---|
| id | UUID | PK |
| entidade_tipo | ENUM(PROCESSO, DESPESA) | NOT NULL |
| entidade_id | UUID | NOT NULL |
| campo_alterado | VARCHAR(50) | NOT NULL |
| valor_anterior | VARCHAR(100) | |
| valor_novo | VARCHAR(100) | NOT NULL |
| alterado_por | UUID | FK → users |
| alterado_em | TIMESTAMP | NOT NULL |
| observacao | TEXT | |

### Regras de negócio

- **Despesa sem processo é válida** — `processo_id` é nullable; `cliente_id` é obrigatório
- **Um cliente pode ter N processos** — sem limite
- **Log de status obrigatório** — qualquer mudança de `status` em processo ou `status_repasse` em despesa deve gerar registro em `historico_status`
- **Upload de comprovante** — o arquivo é enviado para o R2; o banco armazena apenas a URL pública/assinada
- **CPF/CNPJ único** — validação de formato e unicidade no backend

---

## Plano MVP — fases

| Fase | Escopo | Estimativa |
|---|---|---|
| **Fase 1** | Setup do monorepo, CI, banco, migrations Flyway, login JWT, gestão de usuários, layout base | Semanas 1–2 |
| **Fase 2** | CRUD de clientes, validação CPF/CNPJ, busca/filtros, histórico de alterações | Semanas 3–4 |
| **Fase 3** | CRUD de processos, troca de status com auditoria, filtros, listagem por cliente | Semanas 5–6 |
| **Fase 4** | CRUD de despesas, upload de comprovantes (R2), status de repasse com log, filtros | Semanas 7–9 |
| **Fase 5** | Dashboard, relatórios filtráveis, exportação CSV | Semanas 10–11 |

---

## Variáveis de ambiente

### `apps/web/.env.local`

```env
# URL do backend Spring Boot
NEXT_PUBLIC_API_URL=http://localhost:8080

# (produção — Railway)
# NEXT_PUBLIC_API_URL=https://faam-api.up.railway.app
```

### `apps/api/.env`

```env
# Banco de dados
DB_URL=jdbc:postgresql://localhost:5432/faam
DB_USERNAME=faam_user
DB_PASSWORD=sua_senha_aqui

# JWT
JWT_SECRET=chave-secreta-minimo-256-bits-aqui
JWT_EXPIRATION_MS=86400000

# Cloudflare R2
R2_ENDPOINT=https://<ACCOUNT_ID>.r2.cloudflarestorage.com
R2_ACCESS_KEY=sua_access_key
R2_SECRET_KEY=sua_secret_key
R2_BUCKET=faam-attachments
R2_PUBLIC_URL=https://pub-<hash>.r2.dev

# Configurações do servidor
SERVER_PORT=8080
ALLOWED_ORIGINS=http://localhost:3000
```

> ⚠️ **Nunca commitar arquivos `.env` ou `.env.local`.** Eles estão no `.gitignore`.

---

## Como rodar localmente

### Pré-requisitos

- Node.js 20+
- Java 21 (JDK) — recomendado via [SDKMAN](https://sdkman.io/)
- Maven 3.9+
- Docker (para rodar o PostgreSQL local)
- Git

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-org/faam.git
cd faam
```

### 2. Subir o banco de dados local com Docker

```bash
docker run -d \
  --name faam-postgres \
  -e POSTGRES_DB=faam \
  -e POSTGRES_USER=faam_user \
  -e POSTGRES_PASSWORD=senha_local \
  -p 5432:5432 \
  postgres:16
```

### 3. Rodar o backend

```bash
cd apps/api
cp .env.example .env
# Editar .env com as credenciais locais

./mvnw spring-boot:run
# A API estará disponível em http://localhost:8080
# Swagger UI: http://localhost:8080/swagger-ui.html
```

As migrations do Flyway rodam automaticamente na inicialização.

### 4. Rodar o frontend

```bash
cd apps/web
cp .env.local.example .env.local
# Editar se necessário

npm install
npm run dev
# Disponível em http://localhost:3000
```

---

## Deploy

### Backend — Railway

1. Criar projeto no [Railway](https://railway.app)
2. Adicionar serviço **PostgreSQL** (Railway provisiona automaticamente)
3. Adicionar serviço **GitHub Repo** apontando para `apps/api`
4. Configurar variáveis de ambiente na aba *Variables* (ver seção acima)
5. Railway detecta o `Dockerfile` ou usa Nixpacks com Maven

### Frontend — Vercel

1. Importar repositório no [Vercel](https://vercel.com)
2. Definir **Root Directory** como `apps/web`
3. Adicionar variável de ambiente `NEXT_PUBLIC_API_URL` com a URL do Railway
4. Deploy automático a cada push na branch `main`

### Storage — Cloudflare R2

1. Criar bucket `faam-attachments` no [Cloudflare R2](https://dash.cloudflare.com)
2. Gerar API Token com permissão de leitura/escrita
3. Configurar as variáveis `R2_*` no Railway

---

## Convenções e padrões

### Git

- Branch principal: `main`
- Feature branches: `feat/nome-da-feature`
- Fix branches: `fix/nome-do-bug`
- Commits: [Conventional Commits](https://www.conventionalcommits.org/) — ex: `feat(clientes): adicionar validação de CPF`

### Backend (Java)

- Pacote base: `br.com.faam`
- Nomenclatura: `PascalCase` para classes, `camelCase` para métodos
- Controllers retornam sempre `ResponseEntity<T>`
- DTOs separados de entidades (nunca expor entidade JPA diretamente)
- Validações com Bean Validation (`@Valid`, `@NotBlank`, etc.)

### Frontend (TypeScript)

- Componentes: `PascalCase` em `.tsx`
- Hooks: `camelCase` com prefixo `use`
- Rotas protegidas: middleware Next.js verifica JWT antes de renderizar
- Chamadas à API centralizadas em `src/lib/api/`

### Banco de dados

- Migrations sempre via Flyway: `V1__create_users.sql`, `V2__create_clientes.sql`, etc.
- **Nunca alterar migration já aplicada** — criar nova migration
- UUIDs como PK em todas as tabelas
- `created_at` / `updated_at` em todas as tabelas com auditoria
