import { redirect } from "next/navigation";
import { getAllNotificacoes } from "@/lib/db-notificacoes";
import { NotificacoesList } from "@/components/admin/NotificacoesList";

export default async function AdminNotificacoesPage() {
  let notificacoes;
  try {
    notificacoes = await getAllNotificacoes();
  } catch {
    redirect("/login");
  }

  return <NotificacoesList initialNotificacoes={notificacoes} />;
}
