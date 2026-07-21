import { NextRequest, NextResponse } from "next/server";
import {
  createLancamentoPessoal,
  getAllLancamentosPessoal,
  type LancamentoPessoalInput,
} from "@/lib/db-financeiro-pessoal";

const VALID_STATUSES = ["pendente", "pago", "cancelado"];

export async function GET() {
  try {
    const lancamentos = await getAllLancamentosPessoal();
    return NextResponse.json({ lancamentos });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o financeiro pessoal" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const descricao = typeof body?.descricao === "string" ? body.descricao.trim() : "";
  const valor = typeof body?.valor === "number" ? body.valor : NaN;
  const vencimento = typeof body?.vencimento === "string" ? body.vencimento : "";
  const status = VALID_STATUSES.includes(body?.status as string)
    ? (body.status as LancamentoPessoalInput["status"])
    : "pendente";

  if (!descricao || !valor || !vencimento) {
    return NextResponse.json(
      { error: "Descrição, valor e vencimento são obrigatórios" },
      { status: 400 },
    );
  }

  const input: LancamentoPessoalInput = { descricao, valor, vencimento, status };

  try {
    const lancamento = await createLancamentoPessoal(input);
    return NextResponse.json({ lancamento });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o lançamento" },
      { status: 401 },
    );
  }
}
