"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Settings, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { getSessionMock, logoutMock } from "@/lib/mock-auth";
import type { Usuario } from "@/types";

const TITULOS: Record<string, { titulo: string; subtitulo: string }> = {
  "/dashboard": {
    titulo: "Dashboard",
    subtitulo: "Visão geral do escritório",
  },
  "/clientes": {
    titulo: "Clientes",
    subtitulo: "Gerencie sua carteira de clientes",
  },
  "/processos": {
    titulo: "Processos",
    subtitulo: "Acompanhe processos em andamento",
  },
  "/despesas": {
    titulo: "Despesas",
    subtitulo: "Controle financeiro do escritório",
  },
  "/relatorios": {
    titulo: "Relatórios",
    subtitulo: "Exportações e indicadores",
  },
};

function iniciais(nome: string) {
  return nome
    .split(" ")
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  useEffect(() => {
    setUsuario(getSessionMock());
  }, []);

  const rotaBase = "/" + (pathname?.split("/")[1] ?? "");
  const info = TITULOS[rotaBase] ?? { titulo: "FAAM", subtitulo: "" };

  function handleLogout() {
    logoutMock();
    router.push("/auth");
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-background px-6">
      <div>
        <h2 className="font-display text-lg leading-none text-foreground">
          {info.titulo}
        </h2>
        {info.subtitulo && (
          <p className="mt-1 text-xs text-muted">{info.subtitulo}</p>
        )}
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 rounded-md px-2 py-1.5 transition-colors hover:bg-surface-hover">
            <Avatar>
              <AvatarFallback>
                {usuario ? iniciais(usuario.nome) : "..."}
              </AvatarFallback>
            </Avatar>
            <div className="hidden text-left sm:block">
              <p className="text-sm font-medium leading-none text-foreground">
                {usuario?.nome ?? "Carregando..."}
              </p>
              <p className="mt-1 text-xs leading-none text-muted">
                {usuario?.cargo ?? ""}
              </p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Minha conta</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Settings className="h-4 w-4" />
            Configurações
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onClick={handleLogout}>
            <LogOut className="h-4 w-4" />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
