import { NextRequest, NextResponse } from "next/server";
import { setCasoStatus, type CasoStatus } from "@/lib/db-casos";

const VALID_STATUSES: CasoStatus[] = [
  "aberto",
  "em_andamento",
  "aguardando_cliente",
  "concluido",
  "arquivado",
];

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/status">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const status = VALID_STATUSES.includes(body?.status) ? body.status : undefined;

  if (!status) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  try {
    const caso = await setCasoStatus(id, status);
    return NextResponse.json({ caso });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o status" },
      { status: 401 },
    );
  }
}
