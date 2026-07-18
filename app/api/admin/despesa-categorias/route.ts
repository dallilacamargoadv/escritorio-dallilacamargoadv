import { NextRequest, NextResponse } from "next/server";
import { createDespesaCategoria, getAllDespesaCategorias } from "@/lib/db-despesa-categorias";

export async function GET() {
  try {
    const categorias = await getAllDespesaCategorias();
    return NextResponse.json({ categorias });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar as categorias" },
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

  try {
    const categoria = await createDespesaCategoria(nome);
    return NextResponse.json({ categoria });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar a categoria" },
      { status: 401 },
    );
  }
}
