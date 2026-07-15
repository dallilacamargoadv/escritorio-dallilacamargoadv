import { NextRequest, NextResponse } from "next/server";
import { updateLeadStatus, type LeadStatus } from "@/lib/db-admin";

const VALID_STATUSES: LeadStatus[] = [
  "novo",
  "em_contato",
  "qualificado",
  "proposta",
  "cliente",
  "perdido",
];

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]/status">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const status = body?.status as LeadStatus;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Status inválido" }, { status: 400 });
  }

  try {
    await updateLeadStatus(id, status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar o status" },
      { status: 401 },
    );
  }
}
