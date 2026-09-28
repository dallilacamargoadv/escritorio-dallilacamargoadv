import { NextRequest, NextResponse } from "next/server";
import { createConteudoEditorial } from "@/lib/db-conteudo-editorial";

export async function POST(request: NextRequest) {
  const body = await request.json();

  try {
    const conteudo = await createConteudoEditorial({
      data: body.data,
      canal: body.canal,
      formato: body.formato,
      pilar: body.pilar,
      tema: body.tema,
      utm_content: body.utm_content ?? null,
      observacoes: body.observacoes ?? null,
    });
    return NextResponse.json({ conteudo });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível criar o conteúdo" },
      { status: 401 },
    );
  }
}
