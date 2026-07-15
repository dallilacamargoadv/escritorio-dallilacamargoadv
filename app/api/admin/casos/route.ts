import { NextRequest, NextResponse } from "next/server";
import { createCaso, getAllCasos, type CasoInput } from "@/lib/db-casos";
import type { LeadFormType } from "@/lib/db-leads";

const VALID_AREAS: LeadFormType[] = [
  "contratos",
  "propriedade_intelectual",
  "contas_e_plataformas",
  "golpes_virtuais",
  "assessoria_estrategica",
];

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

  const input: CasoInput = {
    contrato_id: contratoId,
    area,
    titulo,
    status: "aberto",
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
