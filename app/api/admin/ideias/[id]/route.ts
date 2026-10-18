import { NextRequest, NextResponse } from "next/server";
import { deleteIdeia, updateIdeia } from "@/lib/db-ideias";
import {
  IDEIA_AREA_LABELS,
  IDEIA_FORMATO_LABELS,
  IDEIA_STATUS_LABELS,
  type IdeiaFormato,
  type IdeiaStatus,
} from "@/lib/ideias-labels";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/ideias/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const patch: {
    titulo?: string;
    formato?: IdeiaFormato;
    area?: string | null;
    gancho?: string | null;
    notas?: string | null;
    status?: IdeiaStatus;
  } = {};

  if (typeof body?.titulo === "string" && body.titulo.trim()) patch.titulo = body.titulo.trim();
  if (body?.formato in IDEIA_FORMATO_LABELS) patch.formato = body.formato;
  if (body?.status in IDEIA_STATUS_LABELS) patch.status = body.status;
  if ("area" in (body ?? {})) {
    patch.area = body.area in IDEIA_AREA_LABELS ? body.area : null;
  }
  for (const campo of ["gancho", "notas"] as const) {
    if (campo in (body ?? {})) {
      const v = body[campo];
      patch[campo] = typeof v === "string" && v.trim() ? v.trim() : null;
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  }

  try {
    const ideia = await updateIdeia(id, patch);
    return NextResponse.json({ ideia });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível atualizar" }, { status: 401 });
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/ideias/[id]">,
) {
  const { id } = await ctx.params;
  try {
    await deleteIdeia(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir" }, { status: 401 });
  }
}
