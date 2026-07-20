import { NextRequest, NextResponse } from "next/server";
import {
  deleteFluxoEtapaTemplate,
  updateFluxoEtapaTemplate,
} from "@/lib/db-fluxo-templates";

function parseChecklist(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/fluxos/[id]/etapas/[etapaId]">,
) {
  const { etapaId } = await ctx.params;
  const body = await request.json();
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";
  const checklist = parseChecklist(body?.checklist);

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  try {
    const etapa = await updateFluxoEtapaTemplate(etapaId, nome, checklist);
    return NextResponse.json({ etapa });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar a etapa" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/fluxos/[id]/etapas/[etapaId]">,
) {
  const { etapaId } = await ctx.params;

  try {
    await deleteFluxoEtapaTemplate(etapaId);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir a etapa" },
      { status: 401 },
    );
  }
}
