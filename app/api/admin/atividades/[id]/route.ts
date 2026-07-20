import { NextRequest, NextResponse } from "next/server";
import {
  getAtividadeById,
  updateAtividade,
  deleteAtividade,
  type AtividadeInput,
  type AtividadeTipo,
  type AtividadeStatus,
} from "@/lib/db-atividades";

const VALID_TIPOS: AtividadeTipo[] = [
  "processual",
  "compromisso",
  "tarefa",
  "documento_pendente",
  "tarefa_delegada",
  "checklist_diario",
];
const VALID_STATUSES: AtividadeStatus[] = ["pendente", "concluido", "cancelado"];

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/atividades/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const atividade = await getAtividadeById(id);
    if (!atividade) {
      return NextResponse.json({ error: "Atividade não encontrada" }, { status: 404 });
    }
    return NextResponse.json({ atividade });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar a atividade" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/atividades/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const tipo: AtividadeTipo | undefined = VALID_TIPOS.includes(body?.tipo)
    ? body.tipo
    : undefined;
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const data = typeof body?.data === "string" ? body.data : "";
  const hora = typeof body?.hora === "string" && body.hora ? body.hora : null;
  const casoFrenteId =
    typeof body?.caso_frente_id === "string" ? body.caso_frente_id : null;
  const casoId = typeof body?.caso_id === "string" ? body.caso_id : null;
  const clienteId = typeof body?.cliente_id === "string" ? body.cliente_id : null;
  const status: AtividadeStatus = VALID_STATUSES.includes(body?.status)
    ? body.status
    : "pendente";
  const visivelCliente = body?.visivel_cliente !== false;

  if (!tipo || !titulo || !data) {
    return NextResponse.json(
      { error: "Tipo, título e data são obrigatórios" },
      { status: 400 },
    );
  }

  const input: AtividadeInput = {
    tipo,
    titulo,
    data,
    hora,
    caso_frente_id: casoFrenteId,
    caso_id: casoId,
    cliente_id: clienteId,
    status,
    visivel_cliente: visivelCliente,
  };

  try {
    const atividade = await updateAtividade(id, input);
    return NextResponse.json({ atividade });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar a atividade" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/atividades/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deleteAtividade(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir a atividade" },
      { status: 401 },
    );
  }
}
