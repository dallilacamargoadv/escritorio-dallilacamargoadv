import { NextRequest, NextResponse } from "next/server";
import {
  getCasoById,
  updateCaso,
  type CasoInput,
  type CasoStatus,
} from "@/lib/db-casos";
import type { LeadFormType } from "@/lib/db-leads";

const VALID_AREAS: LeadFormType[] = [
  "contratos",
  "propriedade_intelectual",
  "contas_e_plataformas",
  "golpes_virtuais",
  "assessoria_estrategica",
];

const VALID_STATUSES: CasoStatus[] = [
  "aberto",
  "em_andamento",
  "aguardando_cliente",
  "concluido",
  "arquivado",
];

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

  const input: CasoInput = {
    contrato_id: contratoId,
    area,
    titulo,
    status,
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
