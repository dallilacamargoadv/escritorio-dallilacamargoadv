import { NextRequest, NextResponse } from "next/server";
import { saveLabConfig } from "@/lib/db-estudos";

export async function PUT(request: NextRequest) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Dados inválidos" }, { status: 400 });
  }
  try {
    const config = await saveLabConfig(body);
    return NextResponse.json({ config });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Não foi possível salvar" }, { status: 401 });
  }
}
