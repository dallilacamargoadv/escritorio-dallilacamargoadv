import { redirect } from "next/navigation";
import { getConteudoEditorialByMes } from "@/lib/db-conteudo-editorial";
import { CalendarioEditorialClient } from "@/components/admin/CalendarioEditorialClient";

export default async function CalendarioEditorialPage({
  searchParams,
}: {
  searchParams: Promise<{ ano?: string; mes?: string }>;
}) {
  const { ano: anoParam, mes: mesParam } = await searchParams;
  const hoje = new Date();
  const ano = anoParam ? parseInt(anoParam, 10) : hoje.getFullYear();
  const mes = mesParam ? parseInt(mesParam, 10) : hoje.getMonth() + 1;

  let conteudos;
  try {
    conteudos = await getConteudoEditorialByMes(ano, mes);
  } catch {
    redirect("/login");
  }

  return <CalendarioEditorialClient ano={ano} mes={mes} conteudosIniciais={conteudos} />;
}
