"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Scale, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginMock } from "@/lib/mock-auth";
import { CREDENCIAIS_DEMO } from "@/lib/mock-data/usuarios";

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState(CREDENCIAIS_DEMO.email);
  const [senha, setSenha] = useState(CREDENCIAIS_DEMO.senha);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setCarregando(true);

    // Pequeno atraso artificial para simular chamada de rede
    await new Promise((r) => setTimeout(r, 600));

    const usuario = loginMock(email, senha);
    setCarregando(false);

    if (!usuario) {
      setErro("E-mail ou senha inválidos.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Glow decorativo de fundo */}
      <div className="pointer-events-none absolute inset-0 bg-seal-ring" />

      <div className="relative w-full max-w-sm animate-fade-in">
        {/* Monograma / selo */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div className="seal-ring flex h-16 w-16 items-center justify-center rounded-full border border-gold/50 bg-surface">
            <Scale className="h-7 w-7 text-gold" strokeWidth={1.5} />
          </div>
          <div className="text-center">
            <h1 className="font-display text-2xl font-medium tracking-wide text-foreground">
              FAAM
            </h1>
            <p className="mt-1 text-sm text-muted">
              Gestão jurídica para escritórios modernos
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-surface p-6 shadow-card">
          <div className="mb-5 hairline-gold" />

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="voce@escritorio.adv.br"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {erro && (
              <p className="rounded-md border border-danger/40 bg-danger-muted px-3 py-2 text-sm text-danger">
                {erro}
              </p>
            )}

            <Button type="submit" size="lg" className="mt-2" disabled={carregando}>
              {carregando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Ambiente de demonstração — dados fictícios.
          <br />
          Credenciais já preenchidas para teste.
        </p>
      </div>
    </div>
  );
}
