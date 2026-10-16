"use client";

import { useEffect } from "react";

// Rótulo da conversão "Contato" criada no Google Ads (conta 142-679-3913).
const CONVERSION_SEND_TO = "AW-18395785348/jkf8CM31pZ8dEITR5cNE";
const CONSENT_KEY = "cookie_consent";
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

function hasMarketingConsent(): boolean {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { marketing?: boolean; decidedAt?: string };
    const decidedAt = new Date(parsed.decidedAt ?? "").getTime();
    if (Number.isNaN(decidedAt) || Date.now() - decidedAt > TWELVE_MONTHS_MS) {
      return false;
    }
    return parsed.marketing === true;
  } catch {
    return false;
  }
}

function isWhatsAppLink(href: string): boolean {
  return /^https:\/\/(wa\.me|api\.whatsapp\.com)\//.test(href);
}

/**
 * Conta como conversão do Google Ads o clique em qualquer link de WhatsApp
 * (header, rodapé, botões e tela final dos formulários). Só dispara se o
 * visitante aceitou cookies de marketing no banner.
 */
export function WhatsAppConversionTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.("a");
      if (!link || !isWhatsAppLink(link.href)) return;
      if (!hasMarketingConsent()) return;

      const w = window as typeof window & {
        gtag?: (...args: unknown[]) => void;
      };
      if (typeof w.gtag !== "function") return;

      w.gtag("event", "conversion", {
        send_to: CONVERSION_SEND_TO,
        transport_type: "beacon",
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
