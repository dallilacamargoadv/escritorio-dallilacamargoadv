import { NextRequest, NextResponse } from "next/server";
import { createFluxoEtapaTemplate } from "@/lib/db-fluxo-templates";

function parseChecklist(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/fluxos/[id]/etapas">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const ordem = typeof body?.ordem === "number" ? body.ordem : 0;
  const checklist = parseChecklist(body?.checklist);
  const slaDias = optionalNumber(body?.sla_dias);
  const minutaUrl = optionalText(body?.minuta_url);

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    const etapa = await createFluxoEtapaTemplate(
      id,
      nome,
      ordem,
      checklist,
      slaDias,
      minutaUrl,
    );
    return NextResponse.json({ etapa });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar a etapa" },
      { status: 401 },
    );
  }
}
