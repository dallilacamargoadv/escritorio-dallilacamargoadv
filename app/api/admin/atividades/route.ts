import { NextRequest, NextResponse } from "next/server";
import {
  createAtividade,
  getAllAtividades,
  type AtividadeInput,
  type AtividadeTipo,
} from "@/lib/db-atividades";

const VALID_TIPOS: AtividadeTipo[] = [
  "processual",
  "compromisso",
  "tarefa",
  "documento_pendente",
  "tarefa_delegada",
  "checklist_diario",
  "audiencia",
  "reuniao_cliente",
  "peca_prazo",
];

export async function GET() {
  try {
    const atividades = await getAllAtividades();
    return NextResponse.json({ atividades });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as atividades" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
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
    status: "pendente",
    visivel_cliente: visivelCliente,
  };

  try {
    const atividade = await createAtividade(input);
    return NextResponse.json({ atividade });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar a atividade" },
      { status: 401 },
    );
  }
}
