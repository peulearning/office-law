# Modelo de Dados — FAAM

> Documento de referência para o banco de dados PostgreSQL.  
> Migrations versionadas em `apps/api/src/main/resources/db/migration/`.

---

## Diagrama de relacionamentos

```
┌──────────┐       ┌────────────┐       ┌───────────┐
│  USERS   │──────▶│  CLIENTES  │──────▶│ PROCESSOS │
└──────────┘  1:N  └────────────┘  1:N  └───────────┘
     │                   │                    │
     │ (criado_por)       │ (cliente_id)       │ (processo_id)
     │                   ▼                    ▼
     │             ┌──────────┐         ┌──────────┐
     └────────────▶│ DESPESAS │────────▶│  ANEXOS  │
      (criado_por) └──────────┘  1:N    └──────────┘
                        │
                        ▼
                ┌───────────────────┐
                │  HISTORICO_STATUS │
                └───────────────────┘
```

### Cardinalidades

| Relação | Tipo | Observação |
|---|---|---|
| USERS → CLIENTES | 1:N | Campo `criado_por` |
| USERS → PROCESSOS | 1:N | Campos `responsavel_id` e `criado_por` |
| USERS → DESPESAS | 1:N | Campo `criado_por` |
| CLIENTES → PROCESSOS | 1:N | Um cliente pode ter múltiplos processos |
| CLIENTES → DESPESAS | 1:N | Cliente obrigatório em toda despesa |
| PROCESSOS → DESPESAS | 1:N | **Processo é opcional** na despesa |
| DESPESAS → ANEXOS | 1:N | Uma despesa pode ter múltiplos comprovantes |

---

## Enumerações

### `perfil_usuario`
```sql
CREATE TYPE perfil_usuario AS ENUM ('ADMIN', 'ADVOGADO');
```
| Valor | Descrição |
|---|---|
| `ADMIN` | Acesso total: usuários, relatórios, configurações |
| `ADVOGADO` | Acesso ao cadastro operacional (clientes, processos, despesas) |

### `tipo_pessoa`
```sql
CREATE TYPE tipo_pessoa AS ENUM ('FISICA', 'JURIDICA');
```

### `status_cliente`
```sql
CREATE TYPE status_cliente AS ENUM ('ATIVO', 'INATIVO');
```

### `status_processo`
```sql
CREATE TYPE status_processo AS ENUM (
  'EM_ANDAMENTO',
  'CONCLUIDO',
  'ARQUIVADO',
  'SUSPENSO'
);
```

### `tipo_despesa`
```sql
CREATE TYPE tipo_despesa AS ENUM (
  'CUSTAS',
  'HONORARIOS',
  'TAXAS',
  'TRANSPORTE',
  'DILIGENCIAS',
  'OUTROS'
);
```

### `status_repasse`
```sql
CREATE TYPE status_repasse AS ENUM (
  'PENDENTE',
  'SOLICITADO',
  'PAGO',
  'CANCELADO'
);
```

### `entidade_historico`
```sql
CREATE TYPE entidade_historico AS ENUM ('PROCESSO', 'DESPESA');
```

---

## DDL completo (referência — gerado via Flyway)

### V1 — Usuários

```sql
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         VARCHAR(150) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  senha_hash   VARCHAR(255) NOT NULL,
  perfil       perfil_usuario NOT NULL,
  ativo        BOOLEAN NOT NULL DEFAULT TRUE,
  criado_em    TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### V2 — Clientes

```sql
CREATE TABLE clientes (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_razao_social VARCHAR(200) NOT NULL,
  tipo_pessoa       tipo_pessoa NOT NULL,
  cpf_cnpj          VARCHAR(18) NOT NULL UNIQUE,
  telefone          VARCHAR(20),
  email             VARCHAR(150),
  logradouro        VARCHAR(200),
  numero            VARCHAR(10),
  complemento       VARCHAR(100),
  cidade            VARCHAR(100),
  uf                CHAR(2),
  cep               VARCHAR(9),
  observacoes       TEXT,
  status            status_cliente NOT NULL DEFAULT 'ATIVO',
  criado_por        UUID NOT NULL REFERENCES users(id),
  criado_em         TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_por    UUID REFERENCES users(id),
  atualizado_em     TIMESTAMP WITH TIME ZONE
);
```

### V3 — Processos

```sql
CREATE TABLE processos (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id         UUID NOT NULL REFERENCES clientes(id),
  numero_processo    VARCHAR(50),
  orgao_vara_foro    VARCHAR(150),
  cidade             VARCHAR(100),
  uf                 CHAR(2),
  tipo               VARCHAR(80),
  data_inicio        DATE,
  data_encerramento  DATE,
  status             status_processo NOT NULL DEFAULT 'EM_ANDAMENTO',
  responsavel_id     UUID REFERENCES users(id),
  observacoes        TEXT,
  criado_por         UUID NOT NULL REFERENCES users(id),
  criado_em          TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_por     UUID REFERENCES users(id),
  atualizado_em      TIMESTAMP WITH TIME ZONE
);
```

### V4 — Despesas

```sql
CREATE TABLE despesas (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id     UUID NOT NULL REFERENCES clientes(id),
  processo_id    UUID REFERENCES processos(id),  -- NULLABLE: despesa pode ser sem processo
  descricao      VARCHAR(300) NOT NULL,
  valor          DECIMAL(12, 2) NOT NULL CHECK (valor >= 0),
  data_despesa   DATE NOT NULL,
  tipo_despesa   tipo_despesa NOT NULL,
  status_repasse status_repasse NOT NULL DEFAULT 'PENDENTE',
  observacoes    TEXT,
  criado_por     UUID NOT NULL REFERENCES users(id),
  criado_em      TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  atualizado_por UUID REFERENCES users(id),
  atualizado_em  TIMESTAMP WITH TIME ZONE
);
```

### V5 — Anexos

```sql
CREATE TABLE anexos (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  despesa_id     UUID NOT NULL REFERENCES despesas(id) ON DELETE CASCADE,
  nome_arquivo   VARCHAR(255) NOT NULL,
  url_storage    VARCHAR(512) NOT NULL,
  mime_type      VARCHAR(100),
  tamanho_bytes  INTEGER,
  enviado_por    UUID NOT NULL REFERENCES users(id),
  enviado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
```

### V6 — Histórico de status

```sql
CREATE TABLE historico_status (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entidade_tipo   entidade_historico NOT NULL,
  entidade_id     UUID NOT NULL,
  campo_alterado  VARCHAR(50) NOT NULL,
  valor_anterior  VARCHAR(100),
  valor_novo      VARCHAR(100) NOT NULL,
  alterado_por    UUID NOT NULL REFERENCES users(id),
  alterado_em     TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  observacao      TEXT
);

-- Índice para busca rápida por entidade
CREATE INDEX idx_historico_entidade ON historico_status(entidade_tipo, entidade_id);
```

### V7 — Índices de performance

```sql
-- Clientes
CREATE INDEX idx_clientes_cpf_cnpj ON clientes(cpf_cnpj);
CREATE INDEX idx_clientes_status    ON clientes(status);

-- Processos
CREATE INDEX idx_processos_cliente_id     ON processos(cliente_id);
CREATE INDEX idx_processos_responsavel_id ON processos(responsavel_id);
CREATE INDEX idx_processos_status         ON processos(status);

-- Despesas
CREATE INDEX idx_despesas_cliente_id    ON despesas(cliente_id);
CREATE INDEX idx_despesas_processo_id   ON despesas(processo_id);
CREATE INDEX idx_despesas_status_repasse ON despesas(status_repasse);
CREATE INDEX idx_despesas_data_despesa   ON despesas(data_despesa);

-- Anexos
CREATE INDEX idx_anexos_despesa_id ON anexos(despesa_id);
```

---

## Regras de negócio

1. **`processo_id` é nullable em `despesas`** — uma despesa pode ser avulsa (vinculada só ao cliente)
2. **`cliente_id` é obrigatório em `despesas`** — toda despesa precisa de um cliente
3. **CPF/CNPJ deve ser único** — validado no backend antes de persistir
4. **Mudança de `status` em processos** deve gerar linha em `historico_status`
5. **Mudança de `status_repasse` em despesas** deve gerar linha em `historico_status`
6. **Exclusão de despesa** exclui em cascata seus `anexos`
7. **Valor de despesa** deve ser >= 0 (check constraint no banco)
8. **Usuário inativo** não pode fazer login, mas seus registros históricos permanecem
