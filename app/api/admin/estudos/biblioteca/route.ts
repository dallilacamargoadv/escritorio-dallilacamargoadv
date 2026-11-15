import { NextRequest, NextResponse } from "next/server";
import { alternarGrifo, DOC_POR_ID, salvarEtiquetas, urlPdf } from "@/lib/db-estudos-biblioteca";

/** GET ?doc=<id>: link temporário (30 min) do PDF original. */
export async function GET(request: NextRequest) {
  const doc = request.nextUrl.searchParams.get("doc") ?? "";
  if (!DOC_POR_ID.has(doc)) return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  try {
    const url = await urlPdf(doc);
    if (!url) return NextResponse.json({ error: "PDF ainda não enviado" }, { status: 404 });
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível abrir" }, { status: 401 });
  }
}

/** POST {acao:"grifo", doc, ref} ou {acao:"etiquetas", doc, etiquetas[]}. */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const doc = typeof body?.doc === "string" ? body.doc : "";
  const d = DOC_POR_ID.get(doc);
  if (!d) return NextResponse.json({ error: "Documento não encontrado" }, { status: 404 });
  try {
    if (body.acao === "grifo") {
      const ref = typeof body.ref === "string" ? body.ref : "";
      if (!d.trechos.some((t) => t.ref === ref)) return NextResponse.json({ error: "Trecho não encontrado" }, { status: 400 });
      return NextResponse.json({ grifado: await alternarGrifo(doc, ref) });
    }
    if (body.acao === "etiquetas") {
      return NextResponse.json({ etiquetas: await salvarEtiquetas(doc, body.etiquetas) });
    }
    return NextResponse.json({ error: "Ação inválida" }, { status: 400 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
