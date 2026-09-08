import { SITE } from "@/lib/site-data";

/**
 * Monta o link wa.me com mensagem pré-preenchida. Usado tanto pro link de
 * contato direto (header/rodapé) quanto pro redirecionamento automático
 * depois que um formulário de área é enviado.
 */
export function getWhatsAppUrl(message?: string): string {
  const base = `https://wa.me/${SITE.whatsapp}`;
  if (!message) return base;
  return `${base}?text=${encodeURIComponent(message)}`;
}
