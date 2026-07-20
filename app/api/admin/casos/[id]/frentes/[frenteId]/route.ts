import { NextRequest, NextResponse } from "next/server";
import { updateFrente, type FrenteInput } from "@/lib/db-frentes";

const VALID_TIPOS = ["extrajudicial", "judicial", "administrativo"];
const VALID_STATUSES = ["aberta", "em_andamento", "concluida", "arquivada"];

function optionalText(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function optionalNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function optionalEtiquetas(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string")
    .map((v) => v.trim())
    .filter(Boolean);
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes/[frenteId]">,
) {
  const { frenteId } = await ctx.params;
  const body = await request.json();
  const tipo = VALID_TIPOS.includes(body?.tipo) ? body.tipo : undefined;

  if (!tipo) {
    return NextResponse.json({ error: "Tipo é obrigatório" }, { status: 400 });
  }

  const input: FrenteInput = {
    tipo,
    orgao: typeof body?.orgao === "string" ? body.orgao.trim() : "",
    numero_processo:
      typeof body?.numero_processo === "string"
        ? body.numero_processo.trim()
        : "",
    status: VALID_STATUSES.includes(body?.status) ? body.status : "aberta",
    tribunal: optionalText(body?.tribunal),
    vara: optionalText(body?.vara),
    comarca: optionalText(body?.comarca),
    classe_processual: optionalText(body?.classe_processual),
    assunto: optionalText(body?.assunto),
    polo_ativo: optionalText(body?.polo_ativo),
    polo_passivo: optionalText(body?.polo_passivo),
    valor_causa: optionalNumber(body?.valor_causa),
    data_distribuicao: optionalText(body?.data_distribuicao),
    ultima_movimentacao: optionalText(body?.ultima_movimentacao),
    ultima_movimentacao_em: optionalText(body?.ultima_movimentacao_em),
    etiquetas: optionalEtiquetas(body?.etiquetas),
    segredo_justica: Boolean(body?.segredo_justica),
  };

  try {
    const frente = await updateFrente(frenteId, input);
    return NextResponse.json({ frente });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar a frente" },
      { status: 401 },
    );
  }
}
