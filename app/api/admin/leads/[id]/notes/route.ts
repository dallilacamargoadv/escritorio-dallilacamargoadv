import { NextRequest, NextResponse } from "next/server";
import { addLeadNote, getLeadNotes } from "@/lib/db-admin";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]/notes">,
) {
  const { id } = await ctx.params;

  try {
    const notes = await getLeadNotes(id);
    return NextResponse.json({ notes });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar as notas" },
      { status: 401 },
    );
  }
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/leads/[id]/notes">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const noteBody = typeof body?.body === "string" ? body.body.trim() : "";

  if (!noteBody) {
    return NextResponse.json(
      { error: "A nota não pode estar vazia" },
      { status: 400 },
    );
  }

  try {
    const note = await addLeadNote(id, noteBody);
    return NextResponse.json({ note });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível salvar a nota" },
      { status: 401 },
    );
  }
}
