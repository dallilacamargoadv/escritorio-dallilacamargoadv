import { NextRequest, NextResponse } from "next/server";
import { createIdeia } from "@/lib/db-ideias";
import {
  IDEIA_AREA_LABELS,
  IDEIA_FORMATO_LABELS,
  type IdeiaFormato,
} from "@/lib/ideias-labels";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const titulo = typeof body?.titulo === "string" ? body.titulo.trim() : "";
  const formato = body?.formato as IdeiaFormato;

  if (!titulo || !(formato in IDEIA_FORMATO_LABELS)) {
    return NextResponse.json(
      { error: "Título e formato são obrigatórios" },
      { status: 400 },
    );
  }

  const area =
    typeof body?.area === "string" && body.area in IDEIA_AREA_LABELS ? body.area : null;
  const texto = (v: unknown) =>
    typeof v === "string" && v.trim() ? v.trim() : null;

  try {
    const ideia = await createIdeia({
      titulo,
      formato,
      area,
      gancho: texto(body?.gancho),
      notas: texto(body?.notas),
    });
    return NextResponse.json({ ideia });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar a ideia" }, { status: 401 });
  }
}
