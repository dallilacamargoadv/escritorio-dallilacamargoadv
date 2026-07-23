import { NextRequest, NextResponse } from "next/server";
import {
  createDespesaCategoriaPessoal,
  getAllDespesaCategoriasPessoal,
} from "@/lib/db-despesa-categorias-pessoal";

export async function GET() {
  try {
    const categorias = await getAllDespesaCategoriasPessoal();
    return NextResponse.json({ categorias });
  } catch (error) {
    console.error(error);
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
    const categoria = await createDespesaCategoriaPessoal(nome);
    return NextResponse.json({ categoria });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar a categoria" },
      { status: 401 },
    );
  }
}
