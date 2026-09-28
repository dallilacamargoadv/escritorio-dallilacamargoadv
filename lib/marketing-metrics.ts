import type { Lead } from "@/lib/db-admin";
import type { ConteudoEditorial } from "@/lib/db-conteudo-editorial";

export interface ConteudoComLeads extends ConteudoEditorial {
  leadsGerados: number;
}

export interface MarketingResumo {
  totalLeads: number;
  leadsPorOrigem: { origem: string; total: number }[];
  conversaoLeadCliente: number | null;
  trouxeAtencao: ConteudoComLeads[];
  geraramLead: ConteudoComLeads[];
  valeRepetir: (ConteudoComLeads & { score: number })[];
}

/** Casa um lead com o conteúdo que o originou, pelo utm_content salvo em
 * leads.utms — único jeito confiável sem digitar duas vezes; "origem" sozinho
 * só diz o canal, não a peça de conteúdo específica. */
function utmContentDoLead(lead: Lead): string | null {
  const utms = lead.utms as Record<string, unknown> | null;
  if (!utms) return null;
  const valor = utms["utm_content"] ?? utms["content"];
  return typeof valor === "string" && valor.length > 0 ? valor : null;
}

export function computeMarketingResumo(
  leads: Lead[],
  conteudos: ConteudoEditorial[],
): MarketingResumo {
  const leadsPorUtmContent = new Map<string, number>();
  for (const lead of leads) {
    const utmContent = utmContentDoLead(lead);
    if (!utmContent) continue;
    leadsPorUtmContent.set(utmContent, (leadsPorUtmContent.get(utmContent) ?? 0) + 1);
  }

  const comLeads: ConteudoComLeads[] = conteudos.map((c) => ({
    ...c,
    leadsGerados: c.utm_content ? (leadsPorUtmContent.get(c.utm_content) ?? 0) : 0,
  }));

  const origemCount = new Map<string, number>();
  for (const lead of leads) {
    origemCount.set(lead.origem, (origemCount.get(lead.origem) ?? 0) + 1);
  }
  const leadsPorOrigem = Array.from(origemCount.entries())
    .map(([origem, total]) => ({ origem, total }))
    .sort((a, b) => b.total - a.total);

  const totalClientes = leads.filter((l) => l.status === "cliente").length;
  const conversaoLeadCliente = leads.length > 0 ? totalClientes / leads.length : null;

  const trouxeAtencao = comLeads
    .filter((c) => c.alcance !== null)
    .sort((a, b) => (b.alcance ?? 0) - (a.alcance ?? 0))
    .slice(0, 8);

  const geraramLead = comLeads
    .filter((c) => c.leadsGerados > 0)
    .sort((a, b) => b.leadsGerados - a.leadsGerados)
    .slice(0, 8);

  const comAmbasMetricas = comLeads.filter((c) => c.alcance !== null);
  const maxAlcance = Math.max(1, ...comAmbasMetricas.map((c) => c.alcance ?? 0));
  const maxLeads = Math.max(1, ...comAmbasMetricas.map((c) => c.leadsGerados));
  const valeRepetir = comAmbasMetricas
    .map((c) => ({
      ...c,
      score:
        Math.round(
          (((c.alcance ?? 0) / maxAlcance) * 0.5 + (c.leadsGerados / maxLeads) * 0.5) * 100,
        ) / 10,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);

  return {
    totalLeads: leads.length,
    leadsPorOrigem,
    conversaoLeadCliente,
    trouxeAtencao,
    geraramLead,
    valeRepetir,
  };
}
