import { NextRequest, NextResponse } from "next/server";
import { deleteDocumento, updateDocumentoMarcoCliente } from "@/lib/db-documentos";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/documentos/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();

  if (body?.marco_cliente !== null && typeof body?.marco_cliente !== "string") {
    return NextResponse.json(
      { error: "marco_cliente é obrigatório (texto ou null)" },
      { status: 400 },
    );
  }

  const marcoCliente =
    typeof body.marco_cliente === "string" && body.marco_cliente.trim()
      ? body.marco_cliente.trim()
      : null;

  try {
    const documento = await updateDocumentoMarcoCliente(id, marcoCliente);
    return NextResponse.json({ documento });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o documento" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/documentos/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteDocumento(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir o documento" },
      { status: 401 },
    );
  }
}
