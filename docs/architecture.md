# Arquitetura e Decisões Técnicas — FAAM

---

## ADR-001 — Monorepo com apps separados

**Decisão:** Monorepo com `apps/web` (Next.js) e `apps/api` (Spring Boot) como projetos independentes.

**Motivo:** Código próximo facilita rastreabilidade e PR único por feature. Cada app tem seu próprio ciclo de build e deploy sem acoplamento de runtime.

**Alternativa rejeitada:** Repositórios separados — dificulta navegação e rastreabilidade entre front e back.

---

## ADR-002 — JWT stateless (sem sessão no servidor)

**Decisão:** Autenticação via JWT com expiração de 24h, sem refresh token no MVP.

**Motivo:** Simplifica a implementação; Railway não tem estado persistente entre instâncias. Refresh token entra na Fase 2 pós-MVP.

**Tradeoff:** Logout não invalida o token imediatamente — aceitável dado o contexto interno e o prazo de expiração curto.

---

## ADR-003 — Flyway para migrations

**Decisão:** Todas as alterações de schema via Flyway, nunca DDL manual.

**Motivo:** Rastreabilidade, reversibilidade e segurança ao subir nova versão em produção.

**Convenção:** `V{N}__{descricao_snake_case}.sql` — ex: `V3__create_processos.sql`

---

## ADR-004 — Cloudflare R2 para storage de arquivos

**Decisão:** Comprovantes de despesas armazenados no R2, URL salva no banco.

**Motivo:** R2 tem 10 GB gratuito, API S3-compatible (Spring AWS SDK funciona sem mudança), sem custo de egress.

**Alternativa rejeitada:** Armazenar arquivo como BYTEA no PostgreSQL — degrada performance do banco e dificulta servir o arquivo diretamente.

---

## ADR-005 — DTOs separados das entidades JPA

**Decisão:** Nunca expor entidade JPA diretamente nos controllers. Sempre usar DTOs de request/response.

**Motivo:** Evita vazamento de dados sensíveis (ex: `senha_hash`), desacopla a API do modelo interno e facilita evolução do schema.

**Ferramenta:** MapStruct para mapeamento entity ↔ DTO sem boilerplate.

---

## Diagrama de sequência — Login

```
Browser          Next.js          Spring Boot      PostgreSQL
   │                │                  │                │
   │  POST /auth/login                 │                │
   │───────────────▶│                  │                │
   │                │  POST /auth/login│                │
   │                │─────────────────▶│                │
   │                │                  │  SELECT users  │
   │                │                  │───────────────▶│
   │                │                  │◀───────────────│
   │                │                  │  bcrypt verify │
   │                │                  │  gera JWT      │
   │                │◀─────────────────│                │
   │◀───────────────│  { token: "..." }│                │
   │  salva token   │                  │                │
   │  localStorage  │                  │                │
```

---

## Diagrama de sequência — Upload de comprovante

```
Browser     Next.js     Spring Boot    Cloudflare R2    PostgreSQL
   │            │             │               │               │
   │  POST /despesas/{id}/anexos              │               │
   │  (multipart/form-data)   │               │               │
   │───────────▶│             │               │               │
   │            │─────────────▶               │               │
   │            │             │  PUT objeto   │               │
   │            │             │──────────────▶│               │
   │            │             │◀──────────────│               │
   │            │             │  INSERT anexos│               │
   │            │             │──────────────────────────────▶│
   │            │◀────────────│               │               │
   │◀───────────│  { id, url }│               │               │
```
