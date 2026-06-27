# API REST — FAAM

> Base URL: `https://faam-api.up.railway.app`  
> Autenticação: `Authorization: Bearer <JWT>` em todas as rotas (exceto `/auth/login`)  
> Swagger UI: `{BASE_URL}/swagger-ui.html`

---

## Autenticação

### `POST /auth/login`
Login do usuário.

**Request:**
```json
{ "email": "advogado@faam.com", "senha": "minhasenha" }
```

**Response 200:**
```json
{
  "token": "eyJhbGci...",
  "tipo": "Bearer",
  "usuario": { "id": "uuid", "nome": "Dr. João", "perfil": "ADVOGADO" }
}
```

---

## Usuários (somente ADMIN)

| Método | Rota | Descrição |
|---|---|---|
| GET | `/usuarios` | Listar todos os usuários |
| GET | `/usuarios/{id}` | Buscar usuário por ID |
| POST | `/usuarios` | Criar usuário |
| PUT | `/usuarios/{id}` | Atualizar usuário |
| PATCH | `/usuarios/{id}/desativar` | Desativar usuário |

---

## Clientes

| Método | Rota | Descrição |
|---|---|---|
| GET | `/clientes` | Listar (filtros: `nome`, `status`, `tipo_pessoa`) |
| GET | `/clientes/{id}` | Detalhe do cliente |
| GET | `/clientes/{id}/processos` | Processos do cliente |
| GET | `/clientes/{id}/despesas` | Despesas do cliente |
| POST | `/clientes` | Criar cliente |
| PUT | `/clientes/{id}` | Atualizar cliente |
| PATCH | `/clientes/{id}/status` | Ativar/inativar cliente |

---

## Processos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/processos` | Listar (filtros: `cliente_id`, `status`, `responsavel_id`) |
| GET | `/processos/{id}` | Detalhe do processo |
| GET | `/processos/{id}/despesas` | Despesas do processo |
| GET | `/processos/{id}/historico` | Histórico de status |
| POST | `/processos` | Criar processo |
| PUT | `/processos/{id}` | Atualizar processo |
| PATCH | `/processos/{id}/status` | Mudar status (gera log) |

---

## Despesas

| Método | Rota | Descrição |
|---|---|---|
| GET | `/despesas` | Listar (filtros: `cliente_id`, `processo_id`, `status_repasse`, `data_inicio`, `data_fim`) |
| GET | `/despesas/{id}` | Detalhe da despesa |
| GET | `/despesas/{id}/historico` | Histórico de status de repasse |
| POST | `/despesas` | Criar despesa |
| PUT | `/despesas/{id}` | Atualizar despesa |
| PATCH | `/despesas/{id}/status-repasse` | Mudar status de repasse (gera log) |
| DELETE | `/despesas/{id}` | Excluir despesa (e anexos) |

---

## Anexos

| Método | Rota | Descrição |
|---|---|---|
| GET | `/despesas/{id}/anexos` | Listar anexos da despesa |
| POST | `/despesas/{id}/anexos` | Upload de comprovante (multipart/form-data) |
| DELETE | `/anexos/{id}` | Excluir anexo |

---

## Relatórios / Dashboard

| Método | Rota | Descrição |
|---|---|---|
| GET | `/dashboard/resumo` | Cards: processos por status, despesas por status_repasse |
| GET | `/relatorios/despesas` | Despesas filtradas (cliente, período, status) — exportável CSV |
| GET | `/relatorios/processos` | Processos filtrados — exportável CSV |

---

## Códigos de resposta padrão

| Código | Significado |
|---|---|
| 200 | OK |
| 201 | Criado com sucesso |
| 204 | Sem conteúdo (DELETE) |
| 400 | Dados inválidos (validação) |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Recurso não encontrado |
| 409 | Conflito (ex: CPF/CNPJ duplicado) |
| 500 | Erro interno |

---

## Formato de erro padrão

```json
{
  "timestamp": "2025-01-15T10:30:00Z",
  "status": 400,
  "erro": "Dados inválidos",
  "mensagens": [
    "cpfCnpj: CPF inválido",
    "nome: não pode estar em branco"
  ],
  "path": "/clientes"
}
```
