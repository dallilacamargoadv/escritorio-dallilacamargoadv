import { NextRequest, NextResponse } from "next/server";
import {
  deleteConteudoEditorial,
  setConteudoPublicado,
  updateConteudoEditorial,
  updateMetricas,
} from "@/lib/db-conteudo-editorial";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/conteudo-editorial/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();

  try {
    if (typeof body?.publicado === "boolean") {
      const conteudo = await setConteudoPublicado(id, body.publicado);
      return NextResponse.json({ conteudo });
    }

    if ("alcance" in body || "interacoes" in body) {
      const conteudo = await updateMetricas(
        id,
        body.alcance ?? null,
        body.interacoes ?? null,
      );
      return NextResponse.json({ conteudo });
    }

    const conteudo = await updateConteudoEditorial(id, body);
    return NextResponse.json({ conteudo });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o conteúdo" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/conteudo-editorial/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteConteudoEditorial(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir o conteúdo" },
      { status: 401 },
    );
  }
}
