// Aviso no Telegram quando entra um lead novo. Sem TELEGRAM_BOT_TOKEN e
// TELEGRAM_CHAT_ID, não faz nada (nunca quebra o envio do formulário). A
// mensagem é mínima de propósito: só nome, área e link do painel. Telefone e
// relato ficam apenas no painel (LGPD).

const PAINEL_URL = "https://www.dallilacamargoadv.com.br/admin/leads";

function tirarAspasEEspacos(valor: string): string {
  return valor.replace(/^["'\s]+|["'\s]+$/g, "");
}

/** Limpa erros comuns de colar o token: espaços, aspas, "bot" ou ":" no começo. */
export function limparToken(bruto: string | undefined): string {
  if (!bruto) return "";
  return tirarAspasEEspacos(bruto).replace(/^bot/i, "").replace(/^[^0-9]+/, "");
}

export function limparChatId(bruto: string | undefined): string {
  if (!bruto) return "";
  return tirarAspasEEspacos(bruto);
}

export interface ResultadoTelegram {
  ok: boolean;
  codigo: number | null;
  descricao: string;
}

export async function enviarTelegram(texto: string): Promise<ResultadoTelegram> {
  const token = limparToken(process.env.TELEGRAM_BOT_TOKEN);
  const chatId = limparChatId(process.env.TELEGRAM_CHAT_ID);
  if (!token || !chatId) {
    return { ok: false, codigo: null, descricao: "variáveis não configuradas" };
  }

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: texto,
        disable_web_page_preview: true,
      }),
    });
    const corpo = (await res.json().catch(() => ({}))) as {
      ok?: boolean;
      error_code?: number;
      description?: string;
    };
    return {
      ok: res.ok && corpo.ok === true,
      codigo: corpo.error_code ?? res.status,
      descricao: corpo.description ?? (res.ok ? "enviado" : "sem descrição"),
    };
  } catch (err) {
    // Não devolver o erro completo: a URL da requisição contém o token do bot.
    return {
      ok: false,
      codigo: null,
      descricao: `falha de rede (${err instanceof Error ? err.name : "erro"})`,
    };
  }
}

export async function notifyNewLead({
  name,
  area,
}: {
  name: string;
  area: string;
}): Promise<void> {
  const resultado = await enviarTelegram(
    `Novo contato no site\nÁrea: ${area}\nNome: ${name}\n\nAbrir no painel: ${PAINEL_URL}`,
  );
  if (!resultado.ok && resultado.descricao !== "variáveis não configuradas") {
    console.error(
      `[notify-lead] Telegram recusou: ${resultado.codigo} ${resultado.descricao}`,
    );
  }
}
