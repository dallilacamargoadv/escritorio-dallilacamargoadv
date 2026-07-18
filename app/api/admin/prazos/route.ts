import { NextRequest, NextResponse } from "next/server";
import { createPrazo, getAllPrazos, type PrazoInput, type PrazoTipo } from "@/lib/db-prazos";

const VALID_TIPOS: PrazoTipo[] = ["processual", "compromisso", "tarefa"];

export async function GET() {
  try {
    const prazos = await getAllPrazos();
    return NextResponse.json({ prazos });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os prazos" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
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
    status: "pendente",
  };

  try {
    const prazo = await createPrazo(input);
    return NextResponse.json({ prazo });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o prazo" },
      { status: 401 },
    );
  }
}
