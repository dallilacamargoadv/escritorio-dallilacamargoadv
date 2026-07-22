import { NextRequest, NextResponse } from "next/server";
import { createParceiro, getAllParceiros, type ParceiroInput } from "@/lib/db-parceiros";

export async function GET() {
  try {
    const parceiros = await getAllParceiros();
    return NextResponse.json({ parceiros });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os parceiros" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const nome = typeof body?.nome === "string" ? body.nome.trim() : "";

  if (!nome) {
    return NextResponse.json({ error: "Nome é obrigatório" }, { status: 400 });
  }

  const input: ParceiroInput = {
    nome,
    tipo_pessoa: body?.tipo_pessoa === "pj" ? "pj" : "pf",
    contato: typeof body?.contato === "string" && body.contato.trim() ? body.contato.trim() : null,
    observacoes:
      typeof body?.observacoes === "string" && body.observacoes.trim()
        ? body.observacoes.trim()
        : null,
  };

  try {
    const parceiro = await createParceiro(input);
    return NextResponse.json({ parceiro });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o parceiro" },
      { status: 401 },
    );
  }
}
