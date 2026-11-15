import { NextRequest, NextResponse } from "next/server";
import { updateEvento, type EventoConcurso } from "@/lib/db-estudos";

const SITUACOES = new Set(["sem_data", "previsto", "confirmado", "realizado"]);

export async function PATCH(request: NextRequest, ctx: RouteContext<"/api/admin/estudos/eventos/[id]">) {
  const { id } = await ctx.params;
  const b = await request.json().catch(() => ({}));
  const patch: Partial<Omit<EventoConcurso, "id" | "ordem" | "titulo">> = {};
  if ("data" in (b ?? {})) {
    if (b.data === null || b.data === "") patch.data = null;
    else if (typeof b.data === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.data)) patch.data = b.data;
    else return NextResponse.json({ error: "Data inválida" }, { status: 400 });
  }
  if (SITUACOES.has(b?.situacao)) patch.situacao = b.situacao;
  if ("fonte_url" in (b ?? {})) {
    const u = typeof b.fonte_url === "string" ? b.fonte_url.trim() : "";
    if (u && !/^https?:\/\//i.test(u)) return NextResponse.json({ error: "O link precisa começar com http:// ou https://" }, { status: 400 });
    patch.fonte_url = u ? u.slice(0, 500) : null;
  }
  if ("nota" in (b ?? {})) patch.nota = typeof b.nota === "string" && b.nota.trim() ? b.nota.trim().slice(0, 1000) : null;
  if (!Object.keys(patch).length) return NextResponse.json({ error: "Nada para atualizar" }, { status: 400 });
  try {
    return NextResponse.json({ evento: await updateEvento(id, patch) });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
