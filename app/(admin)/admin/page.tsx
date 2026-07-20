import { redirect } from "next/navigation";
import { getAllLeads, type Lead } from "@/lib/db-admin";
import { getAllNotificacoes } from "@/lib/db-notificacoes";
import { getAllContratos } from "@/lib/db-contratos";
import { getAllClientes } from "@/lib/db-clientes";
import { getAllCasos } from "@/lib/db-casos";
import { getAllLancamentos } from "@/lib/db-financeiro";
import { getAllAtividades } from "@/lib/db-atividades";
import { AdminOverviewClient } from "@/components/admin/AdminOverviewClient";

export default async function AdminOverviewPage() {
  let leads: Lead[];
  let notificacoes;
  let contratos;
  let clientes;
  let casos;
  let lancamentos;
  let atividades;
  try {
    [leads, notificacoes, contratos, clientes, casos, lancamentos, atividades] =
      await Promise.all([
        getAllLeads(),
        getAllNotificacoes(),
        getAllContratos(),
        getAllClientes(),
        getAllCasos(),
        getAllLancamentos(),
        getAllAtividades(),
      ]);
  } catch {
    redirect("/login");
  }

  const atualizadoEm = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Belem",
  }).format(new Date());

  return (
    <AdminOverviewClient
      leads={leads}
      notificacoes={notificacoes}
      contratos={contratos}
      clientes={clientes}
      casos={casos}
      lancamentos={lancamentos}
      atividades={atividades}
      atualizadoEm={atualizadoEm}
    />
  );
}
