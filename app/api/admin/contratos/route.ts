import { NextRequest, NextResponse } from "next/server";
import {
  createContrato,
  getAllContratos,
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

export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get("clienteId") ?? undefined;

  try {
    const contratos = await getAllContratos(clienteId);
    return NextResponse.json({ contratos });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os contratos" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const clienteId =
    typeof body?.cliente_id === "string" ? body.cliente_id : "";
  const tipo = body?.tipo === "recorrente" ? "recorrente" : "projeto";

  if (!clienteId) {
    return NextResponse.json(
      { error: "Cliente é obrigatório" },
      { status: 400 },
    );
  }

  const status: ContratoStatus = VALID_STATUSES.includes(body?.status)
    ? body.status
    : "rascunho";

  const input: ContratoInput = {
    cliente_id: clienteId,
    tipo,
    status,
    valor: typeof body?.valor === "number" ? body.valor : null,
    periodicidade:
      typeof body?.periodicidade === "string" ? body.periodicidade.trim() : "",
  };

  try {
    const contrato = await createContrato(input);
    return NextResponse.json({ contrato });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o contrato" },
      { status: 401 },
    );
  }
}
