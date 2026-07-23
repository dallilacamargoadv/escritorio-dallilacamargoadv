import { NextRequest, NextResponse } from "next/server";
import { deleteLinkGrupo, updateLinkGrupoTitulo } from "@/lib/db-links";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/link-grupos/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";

  if (!titulo) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  try {
    await updateLinkGrupoTitulo(id, titulo);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o grupo" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/link-grupos/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteLinkGrupo(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir o grupo" },
      { status: 401 },
    );
  }
}
