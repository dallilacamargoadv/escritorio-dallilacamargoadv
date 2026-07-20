import { NextRequest, NextResponse } from "next/server";
import {
  createFluxoTemplate,
  getAllFluxoTemplates,
} from "@/lib/db-fluxo-templates";
import { FORM_TYPE_LABELS } from "@/lib/admin-labels";
import type { LeadFormType } from "@/lib/db-leads";
import type { FrenteTipo } from "@/lib/db-frentes";

const VALID_AREAS = Object.keys(FORM_TYPE_LABELS) as LeadFormType[];
const VALID_TIPOS: FrenteTipo[] = ["extrajudicial", "judicial", "administrativo"];

export async function GET() {
  try {
    const templates = await getAllFluxoTemplates();
    return NextResponse.json({ templates });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os modelos de fluxo" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const area = VALID_AREAS.includes(body?.area) ? body.area : undefined;
  const tipoFrente = VALID_TIPOS.includes(body?.tipo_frente) ? body.tipo_frente : undefined;

  if (!area || !tipoFrente) {
    return NextResponse.json(
      { error: "Área e tipo de frente são obrigatórios" },
      { status: 400 },
    );
  }

  try {
    const template = await createFluxoTemplate(area, tipoFrente);
    return NextResponse.json({ template });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o modelo (já existe um pra essa combinação?)" },
      { status: 401 },
    );
  }
}
