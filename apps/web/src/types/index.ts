// Tipos compartilhados do sistema FAAM.
// Cada módulo (clientes, processos, despesas, relatórios) estende estes tipos
// nas próximas etapas.

export type StatusProcesso = "ativo" | "suspenso" | "arquivado" | "encerrado";

export type StatusDespesa = "pendente" | "paga" | "reembolsada" | "vencida";

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  cargo: string;
  avatarUrl?: string;
}
