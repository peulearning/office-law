import { Users, Gavel, Receipt, TrendingUp } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const RESUMO = [
  { label: "Clientes ativos", valor: "48", icon: Users },
  { label: "Processos em andamento", valor: "23", icon: Gavel },
  { label: "Despesas pendentes", valor: "R$ 12.480", icon: Receipt },
  { label: "Novos casos (mês)", valor: "6", icon: TrendingUp },
] as const;

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {RESUMO.map(({ label, valor, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardDescription>{label}</CardDescription>
              <Icon className="h-4 w-4 text-gold" strokeWidth={1.75} />
            </CardHeader>
            <div className="px-5 pb-5">
              <p className="font-display text-tabular text-2xl text-foreground">
                {valor}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Bem-vindo ao FAAM</CardTitle>
          <CardDescription>
            Esta é uma versão inicial do dashboard. Gráficos de faturamento,
            prazos processuais e atividades recentes serão adicionados na
            próxima etapa.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
