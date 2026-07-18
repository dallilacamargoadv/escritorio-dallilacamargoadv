import { NextRequest, NextResponse } from "next/server";
import { deleteLink, updateLinkTitulo } from "@/lib/db-links";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/links/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";

  if (!titulo) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  try {
    await updateLinkTitulo(id, titulo);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar o link" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/links/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteLink(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir o link" },
      { status: 401 },
    );
  }
}
