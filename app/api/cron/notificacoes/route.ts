import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service";

const DIA_MS = 24 * 60 * 60 * 1000;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const supabase = getServiceRoleClient();
  const now = new Date();
  let created = 0;

  // Leads com SLA vencendo/vencido
  const { data: leads } = await supabase
    .from("leads")
    .select("id, name, sla_due_at")
    .eq("status", "leads")
    .lte("sla_due_at", new Date(now.getTime() + DIA_MS).toISOString());

  for (const lead of leads ?? []) {
    const { data: existente } = await supabase
      .from("notificacoes")
      .select("id")
      .eq("tipo", "lead_sla")
      .eq("lead_id", lead.id)
      .eq("lida", false)
      .limit(1);

    if (!existente || existente.length === 0) {
      await supabase.from("notificacoes").insert({
        tipo: "lead_sla",
        titulo: `SLA do lead "${lead.name}" está vencendo ou vencido`,
        lead_id: lead.id,
      });
      created += 1;
    }
  }

  // Lançamentos financeiros vencendo em até 3 dias ou já vencidos
  const { data: lancamentos } = await supabase
    .from("financeiro_lancamentos")
    .select("id, descricao, vencimento")
    .eq("status", "pendente")
    .lte("vencimento", new Date(now.getTime() + 3 * DIA_MS).toISOString());

  for (const lancamento of lancamentos ?? []) {
    const { data: existente } = await supabase
      .from("notificacoes")
      .select("id")
      .eq("tipo", "financeiro_vencimento")
      .eq("financeiro_id", lancamento.id)
      .eq("lida", false)
      .limit(1);

    if (!existente || existente.length === 0) {
      await supabase.from("notificacoes").insert({
        tipo: "financeiro_vencimento",
        titulo: `Lançamento "${lancamento.descricao}" vencendo ou vencido`,
        financeiro_id: lancamento.id,
      });
      created += 1;
    }
  }

  // Posts em rascunho parados há mais de 30 dias
  const { data: posts } = await supabase
    .from("posts")
    .select("id, title, created_at")
    .eq("published", false)
    .lt("created_at", new Date(now.getTime() - 30 * DIA_MS).toISOString());

  for (const post of posts ?? []) {
    const { data: existente } = await supabase
      .from("notificacoes")
      .select("id")
      .eq("tipo", "blog_rascunho")
      .eq("post_id", post.id)
      .eq("lida", false)
      .limit(1);

    if (!existente || existente.length === 0) {
      await supabase.from("notificacoes").insert({
        tipo: "blog_rascunho",
        titulo: `Rascunho "${post.title}" parado há mais de 30 dias`,
        post_id: post.id,
      });
      created += 1;
    }
  }

  return NextResponse.json({ ok: true, created });
}
