import { NextRequest, NextResponse } from "next/server";
import { deleteDocumento } from "@/lib/db-documentos";

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/documentos/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteDocumento(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir o documento" },
      { status: 401 },
    );
  }
}
