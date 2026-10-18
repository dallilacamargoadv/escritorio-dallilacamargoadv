import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  enviarTelegram,
  limparChatId,
  limparToken,
} from "@/lib/notify-lead";

export const dynamic = "force-dynamic";

function dica(codigo: number | null, descricao: string): string {
  if (codigo === null && descricao === "variáveis não configuradas") {
    return "A Vercel não está enxergando as variáveis TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID. Confira os nomes, se Production está marcado e faça o Redeploy.";
  }
  if (codigo === 401) return "Token inválido: foi revogado ou está com algum caractere errado.";
  if (codigo === 404) return "Token mal formado: confira se o valor na Vercel é só o token, sem espaço ou texto a mais.";
  if (codigo === 400 && /chat not found/i.test(descricao)) {
    return "O Id do chat está errado, ou você ainda não tocou em Iniciar (Start) no seu bot.";
  }
  if (codigo === 403) return "O bot foi bloqueado por você ou não pode te escrever. Abra o bot e toque em Iniciar.";
  return "Veja a descrição do Telegram acima.";
}

/** Diagnóstico do aviso por Telegram. Só para quem está logada no painel. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Faça login no painel primeiro." }, { status: 401 });
  }

  const token = limparToken(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = limparChatId(process.env.TELEGRAM_CHAT_ID);

  const resultado = await enviarTelegram(
    "Teste do aviso do site: se você leu isto, o aviso de lead novo está funcionando.",
  );

  return NextResponse.json({
    tokenPresente: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    chatIdPresente: Boolean(process.env.TELEGRAM_CHAT_ID),
    tokenFormatoOk: /^\d+:[A-Za-z0-9_-]+$/.test(token),
    chatIdFormatoOk: /^-?\d+$/.test(chatId),
    telegram: resultado,
    dica: resultado.ok ? "Tudo certo: a mensagem de teste foi enviada." : dica(resultado.codigo, resultado.descricao),
  });
}
