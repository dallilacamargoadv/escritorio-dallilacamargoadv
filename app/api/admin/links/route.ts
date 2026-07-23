import { NextRequest, NextResponse } from "next/server";
import { createLink } from "@/lib/db-links";
import { detectLinkTipo, type LinkTipo } from "@/lib/link-tipo";

const VALID_TIPOS: LinkTipo[] = [
  "google_docs",
  "google_sheets",
  "google_slides",
  "youtube",
  "pdf",
  "generico",
];

export async function POST(request: NextRequest) {
  const body = await request.json();
  const grupoId = typeof body?.grupo_id === "string" ? body.grupo_id : "";
  const url = typeof body?.url === "string" ? body.url.trim() : "";
  const titulo = typeof body?.titulo === "string" && body.titulo.trim() ? body.titulo.trim() : url;
  const tipo: LinkTipo = VALID_TIPOS.includes(body?.tipo)
    ? body.tipo
    : detectLinkTipo(url);

  if (!grupoId || !url) {
    return NextResponse.json(
      { error: "Grupo e URL são obrigatórios" },
      { status: 400 },
    );
  }

  try {
    const link = await createLink({ grupo_id: grupoId, titulo, url, tipo });
    return NextResponse.json({ link });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar o link" },
      { status: 401 },
    );
  }
}
