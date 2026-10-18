import { redirect } from "next/navigation";
import { getStoriesPeriodo } from "@/lib/db-stories";
import { StoriesPlanejadorClient } from "@/components/admin/StoriesPlanejadorClient";

/** Segunda-feira da semana atual, no fuso do negócio (America/Belem). */
function segundaDaSemana(): string {
  const hoje = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Belem" }).format(new Date());
  const [y, m, d] = hoje.split("-").map(Number);
  const data = new Date(Date.UTC(y, m - 1, d));
  const diff = (data.getUTCDay() + 6) % 7;
  data.setUTCDate(data.getUTCDate() - diff);
  return data.toISOString().slice(0, 10);
}

function somar(iso: string, dias: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const data = new Date(Date.UTC(y, m - 1, d + dias));
  return data.toISOString().slice(0, 10);
}

export default async function StoriesPage() {
  const inicio = segundaDaSemana();
  let planos;
  try {
    planos = await getStoriesPeriodo(inicio, somar(inicio, 6));
  } catch {
    redirect("/login");
  }
  return <StoriesPlanejadorClient inicioInicial={inicio} planosIniciais={planos} />;
}
