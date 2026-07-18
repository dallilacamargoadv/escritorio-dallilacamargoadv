import { NextRequest, NextResponse } from "next/server";
import {
  getPrazoById,
  updatePrazo,
  type PrazoInput,
  type PrazoTipo,
  type PrazoStatus,
} from "@/lib/db-prazos";

const VALID_TIPOS: PrazoTipo[] = ["processual", "compromisso", "tarefa"];
const VALID_STATUSES: PrazoStatus[] = ["pendente", "concluido", "cancelado"];

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/prazos/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const prazo = await getPrazoById(id);
    if (!prazo) {
      return NextResponse.json({ error: "Prazo não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ prazo });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o prazo" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/prazos/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const tipo: PrazoTipo | undefined = VALID_TIPOS.includes(body?.tipo)
    ? body.tipo
    : undefined;
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const data = typeof body?.data === "string" ? body.data : "";
  const hora = typeof body?.hora === "string" && body.hora ? body.hora : null;
  const casoFrenteId =
    typeof body?.caso_frente_id === "string" ? body.caso_frente_id : null;
  const casoId = typeof body?.caso_id === "string" ? body.caso_id : null;
  const clienteId = typeof body?.cliente_id === "string" ? body.cliente_id : null;
  const status: PrazoStatus = VALID_STATUSES.includes(body?.status)
    ? body.status
    : "pendente";

  if (!tipo || !titulo || !data) {
    return NextResponse.json(
      { error: "Tipo, título e data são obrigatórios" },
      { status: 400 },
    );
  }

  const input: PrazoInput = {
    tipo,
    titulo,
    data,
    hora,
    caso_frente_id: casoFrenteId,
    caso_id: casoId,
    cliente_id: clienteId,
    status,
  };

  try {
    const prazo = await updatePrazo(id, input);
    return NextResponse.json({ prazo });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar o prazo" },
      { status: 401 },
    );
  }
}
