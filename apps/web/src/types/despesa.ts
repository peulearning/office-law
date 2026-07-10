export type CategoriaDespesa =
  | "Custas"
  | "Honorários"
  | "Transporte"
  | "Alimentação"
  | "Outros";

export interface Despesa {
  id: string;
  descricao: string;
  categoria: CategoriaDespesa;
  valor: number;
  data: string;
  comprovante?: string;
}
