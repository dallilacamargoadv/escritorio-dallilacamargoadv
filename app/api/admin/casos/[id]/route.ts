import { NextRequest, NextResponse } from "next/server";
import {
  getCasoById,
  updateCaso,
  type CasoInput,
  type CasoStatus,
  type CasoPrioridade,
} from "@/lib/db-casos";
import type { LeadFormType } from "@/lib/db-leads";
import { FORM_TYPE_LABELS } from "@/lib/admin-labels";

const VALID_AREAS = Object.keys(FORM_TYPE_LABELS) as LeadFormType[];

const VALID_STATUSES: CasoStatus[] = [
  "aberto",
  "em_andamento",
  "aguardando_cliente",
  "concluido",
  "arquivado",
];

const VALID_PRIORIDADES: CasoPrioridade[] = ["baixa", "media", "alta", "urgente"];

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const caso = await getCasoById(id);
    if (!caso) {
      return NextResponse.json({ error: "Caso não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ caso });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o caso" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const contratoId =
    typeof body?.contrato_id === "string" ? body.contrato_id : "";
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const area: LeadFormType | undefined = VALID_AREAS.includes(body?.area)
    ? body.area
    : undefined;
  const status: CasoStatus = VALID_STATUSES.includes(body?.status)
    ? body.status
    : "aberto";

  if (!contratoId || !titulo || !area) {
    return NextResponse.json(
      { error: "Contrato, área e título são obrigatórios" },
      { status: 400 },
    );
  }

  const prioridade: CasoPrioridade = VALID_PRIORIDADES.includes(body?.prioridade)
    ? body.prioridade
    : "media";
  const slaHoras =
    typeof body?.sla_horas === "number" && Number.isFinite(body.sla_horas)
      ? body.sla_horas
      : null;
  const categoria =
    typeof body?.categoria === "string" && body.categoria.trim()
      ? body.categoria.trim()
      : null;
  const responsavel =
    typeof body?.responsavel === "string" && body.responsavel.trim()
      ? body.responsavel.trim()
      : null;

  const input: CasoInput = {
    contrato_id: contratoId,
    area,
    titulo,
    status,
    prioridade,
    sla_horas: slaHoras,
    categoria,
    responsavel,
  };

  try {
    const caso = await updateCaso(id, input);
    return NextResponse.json({ caso });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar o caso" },
      { status: 401 },
    );
  }
}
