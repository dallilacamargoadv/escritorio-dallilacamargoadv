import { NextResponse } from "next/server";
import {
  getAllNotificacoes,
  markAllNotificacoesAsRead,
} from "@/lib/db-notificacoes";

export async function GET() {
  try {
    const notificacoes = await getAllNotificacoes();
    return NextResponse.json({ notificacoes });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar as notificações" },
      { status: 401 },
    );
  }
}

export async function PATCH() {
  try {
    await markAllNotificacoesAsRead();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível marcar as notificações como lidas" },
      { status: 401 },
    );
  }
}
