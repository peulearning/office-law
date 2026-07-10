"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  LayoutDashboard,
  Users,
  Gavel,
  Receipt,
  FileBarChart,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clientes", label: "Clientes", icon: Users },
  { href: "/processos", label: "Processos", icon: Gavel },
  { href: "/despesas", label: "Despesas", icon: Receipt },
  { href: "/relatorios", label: "Relatórios", icon: FileBarChart },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      {/* Marca */}
      <div className="flex items-center gap-3 px-6 py-6">
        <div className="seal-ring flex h-10 w-10 items-center justify-center rounded-full border border-gold/50 bg-surface-elevated">
          <Scale className="h-4 w-4 text-gold" strokeWidth={1.5} />
        </div>
        <div>
          <p className="font-display text-lg leading-none tracking-wide text-foreground">
            FAAM
          </p>
          <p className="text-[11px] leading-none text-muted mt-1">
            Gestão Jurídica
          </p>
        </div>
      </div>

      <div className="mx-6 hairline-gold" />

      {/* Navegação */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-6">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const ativo = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                ativo
                  ? "bg-gold-muted text-gold"
                  : "text-muted hover:bg-surface-hover hover:text-foreground"
              )}
            >
              <Icon
                className={cn(
                  "h-4 w-4 shrink-0",
                  ativo ? "text-gold" : "text-muted group-hover:text-foreground"
                )}
                strokeWidth={1.75}
              />
              {label}
              {ativo && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-gold" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Rodapé da sidebar */}
      <div className="border-t border-border px-6 py-4">
        <p className="text-[11px] text-muted">
          FAAM © {new Date().getFullYear()} — Ambiente de demonstração
        </p>
      </div>
    </aside>
  );
}
