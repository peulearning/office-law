import type { Metadata } from "next";
import { fontDisplay, fontSans, fontMono } from "../../lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "FAAM · Gestão Jurídica",
  description:
    "Sistema de gestão para escritórios de advocacia — clientes, processos, despesas e relatórios.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
