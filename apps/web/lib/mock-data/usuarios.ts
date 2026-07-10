import type { Usuario } from "../../src/types/";

// Credenciais de demonstração — sistema 100% mockado, sem backend.
export const USUARIOS_MOCK: (Usuario & { senha: string })[] = [
  {
    id: "u1",
    nome: "Fernanda Aragão",
    email: "fernanda@faam.adv.br",
    senha: "123456",
    cargo: "Sócia-fundadora",
  },
  {
    id: "u2",
    nome: "Marcos Villela",
    email: "marcos@faam.adv.br",
    senha: "123456",
    cargo: "Advogado associado",
  },
];

export const CREDENCIAIS_DEMO = {
  email: "fernanda@faam.adv.br",
  senha: "123456",
};
