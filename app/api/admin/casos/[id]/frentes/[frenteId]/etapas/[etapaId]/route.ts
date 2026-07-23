import { NextRequest, NextResponse } from "next/server";
import {
  deleteFrenteEtapa,
  iniciarTimerEtapa,
  pausarTimerEtapa,
  setFrenteEtapaChecklist,
  setFrenteEtapaDocumento,
  setFrenteEtapaStatus,
  type FrenteEtapaStatus,
} from "@/lib/db-frente-etapas";

const VALID_STATUSES: FrenteEtapaStatus[] = ["pendente", "concluida"];

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes/[frenteId]/etapas/[etapaId]">,
) {
  const { id, etapaId } = await ctx.params;
  const body = await request.json();

  try {
    if (body?.timer_action === "start") {
      const etapa = await iniciarTimerEtapa(etapaId);
      return NextResponse.json({ etapa });
    }

    if (body?.timer_action === "stop") {
      const etapa = await pausarTimerEtapa(etapaId);
      return NextResponse.json({ etapa });
    }

    if (VALID_STATUSES.includes(body?.status)) {
      const etapa = await setFrenteEtapaStatus(etapaId, id, body.status);
      return NextResponse.json({ etapa });
    }

    if (Array.isArray(body?.checklist_marcados)) {
      const marcados = body.checklist_marcados.filter(
        (v: unknown): v is number => typeof v === "number",
      );
      const etapa = await setFrenteEtapaChecklist(etapaId, marcados);
      return NextResponse.json({ etapa });
    }

    if ("documento_id" in body) {
      const documentoId = typeof body.documento_id === "string" ? body.documento_id : null;
      const etapa = await setFrenteEtapaDocumento(etapaId, documentoId);
      return NextResponse.json({ etapa });
    }

    return NextResponse.json({ error: "Nada pra atualizar" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar a etapa" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes/[frenteId]/etapas/[etapaId]">,
) {
  const { etapaId } = await ctx.params;

  try {
    await deleteFrenteEtapa(etapaId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir a etapa" },
      { status: 401 },
    );
  }
}
