import { NextRequest, NextResponse } from "next/server";
import {
  createLancamento,
  createLancamentosLote,
  getAllLancamentos,
  type LancamentoInput,
} from "@/lib/db-financeiro";

export async function GET(request: NextRequest) {
  const clienteId = request.nextUrl.searchParams.get("clienteId") ?? undefined;

  try {
    const lancamentos = await getAllLancamentos(clienteId);
    return NextResponse.json({ lancamentos });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o financeiro" },
      { status: 401 },
    );
  }
}

function addMonths(dateIso: string, months: number): string {
  // Aritmética em UTC, mesmo padrão de lib/format.ts, para não derivar um dia
  // dependendo do fuso horário do processo do servidor.
  const date = new Date(dateIso);
  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString();
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const contratoId =
    typeof body?.contrato_id === "string" ? body.contrato_id : "";
  const clienteId =
    typeof body?.cliente_id === "string" ? body.cliente_id : "";
  const descricao =
    typeof body?.descricao === "string" ? body.descricao.trim() : "";
  const valor = typeof body?.valor === "number" ? body.valor : NaN;
  const vencimento =
    typeof body?.vencimento === "string" ? body.vencimento : "";
  const tipo = body?.tipo === "parcelado" || body?.tipo === "recorrente"
    ? body.tipo
    : "unico";
  const quantidade =
    typeof body?.quantidade === "number" && body.quantidade > 1
      ? Math.floor(body.quantidade)
      : 1;

  if (!contratoId || !clienteId || !descricao || !valor || !vencimento) {
    return NextResponse.json(
      { error: "Contrato, descrição, valor e vencimento são obrigatórios" },
      { status: 400 },
    );
  }

  try {
    if (tipo === "unico" || quantidade <= 1) {
      const input: LancamentoInput = {
        contrato_id: contratoId,
        cliente_id: clienteId,
        descricao,
        valor,
        vencimento,
      };
      const lancamento = await createLancamento(input);
      return NextResponse.json({ lancamento });
    }

    const grupoId = crypto.randomUUID();
    const inputs: LancamentoInput[] = Array.from({ length: quantidade }, (_, i) => ({
      contrato_id: contratoId,
      cliente_id: clienteId,
      descricao:
        tipo === "parcelado"
          ? `${descricao} (Parcela ${i + 1}/${quantidade})`
          : `${descricao} (mês ${i + 1})`,
      valor,
      vencimento: addMonths(vencimento, i),
      grupo_id: grupoId,
    }));

    const lancamentos = await createLancamentosLote(inputs);
    return NextResponse.json({ lancamentos });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar o(s) lançamento(s)" },
      { status: 401 },
    );
  }
}
