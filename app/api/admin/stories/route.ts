import { NextRequest, NextResponse } from "next/server";
import {
  excluirStoriesPlano,
  getStoriesPeriodo,
  salvarStoriesPlano,
} from "@/lib/db-stories";
import { STORY_TELA_LABELS, type StoryTela, type StoryTelaTipo } from "@/lib/ideias-labels";

const DATA = /^\d{4}-\d{2}-\d{2}$/;

export async function GET(request: NextRequest) {
  const inicio = request.nextUrl.searchParams.get("inicio") ?? "";
  const fim = request.nextUrl.searchParams.get("fim") ?? "";
  if (!DATA.test(inicio) || !DATA.test(fim)) {
    return NextResponse.json({ error: "Período inválido" }, { status: 400 });
  }
  try {
    const planos = await getStoriesPeriodo(inicio, fim);
    return NextResponse.json({ planos });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível carregar" }, { status: 401 });
  }
}

export async function PUT(request: NextRequest) {
  const body = await request.json();
  const data = typeof body?.data === "string" ? body.data : "";
  if (!DATA.test(data)) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }
  const tema = typeof body?.tema === "string" ? body.tema.slice(0, 120) : "";
  const telas: StoryTela[] = Array.isArray(body?.telas)
    ? body.telas
        .filter((t: { tipo?: string }) => typeof t?.tipo === "string" && t.tipo in STORY_TELA_LABELS)
        .slice(0, 20)
        .map((t: { tipo: StoryTelaTipo; texto?: unknown }) => ({
          tipo: t.tipo,
          texto: typeof t.texto === "string" ? t.texto.slice(0, 300) : "",
        }))
    : [];

  try {
    const plano = await salvarStoriesPlano({ data, tema, telas });
    return NextResponse.json({ plano });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}

export async function DELETE(request: NextRequest) {
  const data = request.nextUrl.searchParams.get("data") ?? "";
  if (!DATA.test(data)) {
    return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }
  try {
    await excluirStoriesPlano(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível excluir" }, { status: 401 });
  }
}
