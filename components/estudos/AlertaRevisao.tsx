import Link from "next/link";
import { BellRing } from "lucide-react";
import { CARTOES, getEstadosCartoes, getEstadosRevisao, getRespostas, QUESTAO_POR_ID } from "@/lib/db-estudos";
import { agendaArtigos, agendaQuestoes, dataBelem, ETAPA_FINAL, etapaDoCartao, NOVOS_CARTOES_POR_DIA, venceCartao } from "@/lib/estudos-revisao";
import { metodoDoDia } from "@/lib/estudos-trilhas";
import { todayBelemDateString } from "@/lib/atividades-utils";

/** Alerta do dia: cartões, questões e artigos a revisar + um método de revisão ativa. */
export async function AlertaRevisao() {
  const hoje = todayBelemDateString();
  let cartoes = 0;
  let novos = 0;
  let questoes = 0;
  let artigos = 0;
  try {
    const [respostas, estados, revisao] = await Promise.all([getRespostas(), getEstadosCartoes(), getEstadosRevisao()]);
    let novosHoje = 0;
    for (const c of CARTOES) {
      const e = estados.get(c.id);
      if (!e) continue;
      if (typeof e.first === "number" && dataBelem(e.first) === hoje) novosHoje++;
      const v = venceCartao(e);
      if (etapaDoCartao(e) < ETAPA_FINAL && v && v <= hoje) cartoes++;
    }
    novos = Math.max(0, NOVOS_CARTOES_POR_DIA - novosHoje);
    questoes = agendaQuestoes(respostas, QUESTAO_POR_ID).filter((q) => q.vence_em <= hoje).length;
    artigos = agendaArtigos(respostas, QUESTAO_POR_ID, revisao).filter((a) => a.vence_em <= hoje).length;
  } catch {
    return null;
  }
  const m = metodoDoDia(hoje);
  const pendente = cartoes + questoes + artigos + novos > 0;
  return (
    <div className={`mb-4 rounded-2xl border p-4 ${pendente ? "border-e-warn bg-e-warn-soft" : "border-e-line bg-e-card"}`}>
      <p className="flex items-center gap-2 text-sm font-medium text-e-ink">
        <BellRing size={16} aria-hidden="true" />
        {pendente
          ? `Revisão de hoje: ${cartoes} cartões vencidos${novos ? ` + ${novos} novos` : ""}, ${questoes} questões e ${artigos} artigos.`
          : "Revisão de hoje em dia. Nada vencido."}
        {pendente && (
          <Link href="/admin/estudos/revisao" className="ml-auto rounded-full bg-e-glow px-3 py-1 text-xs font-medium text-e-bg">
            Resolver agora
          </Link>
        )}
      </p>
      <p className="mt-2 text-xs text-e-dim">
        <span className="font-medium text-e-ink">Revisão ativa do dia: {m.nome}.</span> {m.como}
      </p>
    </div>
  );
}
