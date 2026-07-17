import { createClient } from "@/lib/supabase/server";

export type NotificacaoTipo = "lead_sla" | "financeiro_vencimento" | "blog_rascunho";

export interface Notificacao {
  id: string;
  tipo: NotificacaoTipo;
  titulo: string;
  lead_id: string | null;
  financeiro_id: string | null;
  post_id: string | null;
  lida: boolean;
  created_at: string;
}

export async function getAllNotificacoes(): Promise<Notificacao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notificacoes")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data as Notificacao[];
}

export async function getUnreadNotificacoesCount(): Promise<number> {
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notificacoes")
    .select("*", { count: "exact", head: true })
    .eq("lida", false);

  if (error) throw error;
  return count ?? 0;
}

export async function markNotificacaoAsRead(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("id", id);

  if (error) throw error;
}

export async function markAllNotificacoesAsRead(): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("notificacoes")
    .update({ lida: true })
    .eq("lida", false);

  if (error) throw error;
}
