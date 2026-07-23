import { NextRequest, NextResponse } from "next/server";
import {
  getContratoById,
  updateContrato,
  type ContratoInput,
  type ContratoStatus,
} from "@/lib/db-contratos";

const VALID_STATUSES: ContratoStatus[] = [
  "rascunho",
  "enviado",
  "assinado",
  "encerrado",
  "cancelado",
];

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/contratos/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const contrato = await getContratoById(id);
    if (!contrato) {
      return NextResponse.json(
        { error: "Contrato não encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ contrato });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o contrato" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/contratos/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const clienteId =
    typeof body?.cliente_id === "string" ? body.cliente_id : "";
  const tipo = body?.tipo === "recorrente" ? "recorrente" : "projeto";
  const status: ContratoStatus = VALID_STATUSES.includes(body?.status)
    ? body.status
    : "rascunho";

  if (!clienteId) {
    return NextResponse.json(
      { error: "Cliente é obrigatório" },
      { status: 400 },
    );
  }

  const input: ContratoInput = {
    cliente_id: clienteId,
    tipo,
    status,
    valor: typeof body?.valor === "number" ? body.valor : null,
    periodicidade:
      typeof body?.periodicidade === "string" ? body.periodicidade.trim() : "",
  };

  try {
    const contrato = await updateContrato(id, input);
    return NextResponse.json({ contrato });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o contrato" },
      { status: 401 },
    );
  }
}
