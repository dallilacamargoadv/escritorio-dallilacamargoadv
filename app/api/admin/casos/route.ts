import { NextRequest, NextResponse } from "next/server";
import {
  createCaso,
  getAllCasos,
  type CasoInput,
  type CasoPrioridade,
} from "@/lib/db-casos";
import type { LeadFormType } from "@/lib/db-leads";
import { FORM_TYPE_LABELS } from "@/lib/admin-labels";

const VALID_AREAS = Object.keys(FORM_TYPE_LABELS) as LeadFormType[];
const VALID_PRIORIDADES: CasoPrioridade[] = ["baixa", "media", "alta", "urgente"];

export async function GET(request: NextRequest) {
  const contratoId = request.nextUrl.searchParams.get("contratoId") ?? undefined;

  try {
    const casos = await getAllCasos(contratoId);
    return NextResponse.json({ casos });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os casos" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const contratoId =
    typeof body?.contrato_id === "string" ? body.contrato_id : "";
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const area: LeadFormType | undefined = VALID_AREAS.includes(body?.area)
    ? body.area
    : undefined;

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
    status: "aberto",
    prioridade,
    sla_horas: slaHoras,
    categoria,
    responsavel,
  };

  try {
    const caso = await createCaso(input);
    return NextResponse.json({ caso });
  } catch (err) {
    if (err instanceof Error && err.message.includes("contrato assinado")) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: "Não foi possível criar o caso" },
      { status: 401 },
    );
  }
}
