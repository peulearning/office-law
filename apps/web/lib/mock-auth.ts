"use client";

import type { Usuario } from "../src/types";
import { USUARIOS_MOCK } from "@/lib/mock-data/usuarios";

const SESSION_KEY = "faam_session";

export function loginMock(email: string, senha: string): Usuario | null {
  const encontrado = USUARIOS_MOCK.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.senha === senha
  );
  if (!encontrado) return null;

  const { senha: _senha, ...usuario } = encontrado;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(usuario));
  }
  return usuario;
}

export function getSessionMock(): Usuario | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Usuario;
  } catch {
    return null;
  }
}

export function logoutMock() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
  }
}
