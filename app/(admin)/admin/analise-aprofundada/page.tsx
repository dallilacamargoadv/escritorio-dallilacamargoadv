import { redirect } from "next/navigation";
import { getAllLeads } from "@/lib/db-admin";
import { getAllClientes } from "@/lib/db-clientes";
import { AnaliseAprofundadaClient } from "@/components/admin/AnaliseAprofundadaClient";

export default async function AnaliseAprofundadaPage() {
  let leads;
  let clientes;
  try {
    [leads, clientes] = await Promise.all([getAllLeads(), getAllClientes()]);
  } catch {
    redirect("/login");
  }

  return <AnaliseAprofundadaClient initialLeads={leads} clientes={clientes} />;
}
