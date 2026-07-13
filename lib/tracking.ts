// Notificação assíncrona (fire-and-forget) de conversão de lead.
// Meta Pixel / Meta CAPI / GA4 são opcionais: sem as variáveis de ambiente
// configuradas, as funções abaixo não fazem nada (nunca quebram o submit).

interface TrackLeadParams {
  eventId: string;
  contentName: string;
  value?: number;
}

export function trackLead({ eventId, contentName, value = 0 }: TrackLeadParams) {
  if (typeof window === "undefined") return;

  const w = window as typeof window & {
    fbq?: (...args: unknown[]) => void;
    gtag?: (...args: unknown[]) => void;
  };

  if (typeof w.fbq === "function") {
    w.fbq(
      "track",
      "Lead",
      { content_name: contentName, value, currency: "BRL" },
      { eventID: eventId },
    );
  }

  if (typeof w.gtag === "function") {
    w.gtag("event", "generate_lead", {
      content_name: contentName,
      value,
      currency: "BRL",
    });
  }
}

interface SendMetaLeadEventParams {
  eventId: string;
  email: string;
  phone: string;
  name: string;
  contentName: string;
  sourceUrl?: string;
  ip?: string;
  userAgent?: string;
}

export async function sendMetaLeadEvent(params: SendMetaLeadEventParams) {
  const pixelId = process.env.META_PIXEL_ID;
  const accessToken = process.env.META_ACCESS_TOKEN;

  // Integração de Ads (Meta CAPI) ainda não configurada para este projeto.
  if (!pixelId || !accessToken) return;

  const { createHash } = await import("node:crypto");
  const hash = (value: string) =>
    createHash("sha256").update(value.trim().toLowerCase()).digest("hex");

  await fetch(
    `https://graph.facebook.com/v20.0/${pixelId}/events?access_token=${accessToken}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: [
          {
            event_name: "Lead",
            event_id: params.eventId,
            event_time: Math.floor(Date.now() / 1000),
            action_source: "website",
            event_source_url: params.sourceUrl,
            user_data: {
              em: [hash(params.email)],
              ph: [hash(params.phone.replace(/\D/g, ""))],
              client_ip_address: params.ip,
              client_user_agent: params.userAgent,
            },
            custom_data: { content_name: params.contentName },
          },
        ],
      }),
    },
  );
}
