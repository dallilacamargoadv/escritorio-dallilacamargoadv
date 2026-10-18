// Aviso no Telegram quando entra um lead novo. Sem TELEGRAM_BOT_TOKEN e
// TELEGRAM_CHAT_ID, não faz nada (nunca quebra o envio do formulário). A
// mensagem é mínima de propósito: só nome, área e link do painel. Telefone e
// relato ficam apenas no painel (LGPD).

const PAINEL_URL = "https://www.dallilacamargoadv.com.br/admin/leads";

export async function notifyNewLead({
  name,
  area,
}: {
  name: string;
  area: string;
}): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: `Novo contato no site\nÁrea: ${area}\nNome: ${name}\n\nAbrir no painel: ${PAINEL_URL}`,
        disable_web_page_preview: true,
      }),
    });
    if (!res.ok) {
      console.error("[notify-lead] Telegram respondeu", res.status);
    }
  } catch (err) {
    // Não registrar o erro completo: a URL da requisição contém o token do bot.
    console.error("[notify-lead] falha ao enviar aviso", err instanceof Error ? err.name : "erro");
  }
}
