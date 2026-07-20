import { NextRequest, NextResponse } from "next/server";
import { getDocumentoDownloadUrl } from "@/lib/db-documentos";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/documentos/[id]/download">,
) {
  const { id } = await ctx.params;

  try {
    const url = await getDocumentoDownloadUrl(id);
    return NextResponse.json({ url });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível gerar o link de download" },
      { status: 401 },
    );
  }
}
