import { NextRequest, NextResponse } from "next/server";
import { getServiceRoleClient } from "@/lib/supabase/service";
import { fetchComunicaPje, resumoComunicaPjeItem } from "@/lib/comunica-pje";

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

  // Onda 8: consulta automática ao Comunica PJe (CNJ) das frentes judiciais
  // ativas com número de processo — puxa movimentação nova, registra na
  // linha do tempo do caso (caso_historico) e atualiza ultima_movimentacao.
  let pjeAtualizacoes = 0;
  const { data: frentesJudiciais } = await supabase
    .from("caso_frentes")
    .select("id, caso_id, numero_processo, ultima_movimentacao_em")
    .eq("tipo", "judicial")
    .not("numero_processo", "is", null)
    .not("status", "in", "(concluida,arquivada)");

  for (const frente of frentesJudiciais ?? []) {
    if (!frente.numero_processo) continue;

    let items;
    try {
      items = await fetchComunicaPje(frente.numero_processo);
    } catch {
      continue;
    }
    if (items.length === 0) continue;

    const ultimaVista = frente.ultima_movimentacao_em
      ? new Date(frente.ultima_movimentacao_em).getTime()
      : null;

    const novos = items
      .filter((item) => {
        const t = new Date(item.data_disponibilizacao).getTime();
        return ultimaVista === null || t > ultimaVista;
      })
      .sort(
        (a, b) =>
          new Date(a.data_disponibilizacao).getTime() -
          new Date(b.data_disponibilizacao).getTime(),
      );

    if (novos.length === 0) continue;

    for (const item of novos) {
      await supabase.from("caso_historico").insert({
        caso_id: frente.caso_id,
        texto: resumoComunicaPjeItem(item),
        autor: "Comunica PJe (automático)",
      });
    }

    const ultimo = novos[novos.length - 1];
    await supabase
      .from("caso_frentes")
      .update({
        ultima_movimentacao: resumoComunicaPjeItem(ultimo),
        ultima_movimentacao_em: ultimo.data_disponibilizacao.slice(0, 10),
      })
      .eq("id", frente.id);

    pjeAtualizacoes += novos.length;
  }

  return NextResponse.json({ ok: true, created, pjeAtualizacoes });
}
