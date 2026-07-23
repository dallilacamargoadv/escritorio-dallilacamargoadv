import { NextRequest, NextResponse } from "next/server";
import { createLinkGrupo, getAllLinkGrupos } from "@/lib/db-links";

export async function GET() {
  try {
    const grupos = await getAllLinkGrupos();
    return NextResponse.json({ grupos });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar os grupos" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";

  if (!titulo) {
    return NextResponse.json({ error: "Título é obrigatório" }, { status: 400 });
  }

  try {
    const grupo = await createLinkGrupo(titulo);
    return NextResponse.json({ grupo });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar o grupo" },
      { status: 401 },
    );
  }
}
