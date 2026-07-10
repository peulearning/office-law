export type StatusProcesso =
  | "Em andamento"
  | "Concluído"
  | "Suspenso";

export interface Processo {
  id: string;
  numero: string;
  clienteId: string;
  clienteNome: string;
  titulo: string;
  vara: string;
  status: StatusProcesso;
  responsavel: string;
  dataAbertura: string;
  valorCausa: number;
}
