"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

const STORAGE_KEY = "cookie_consent";
const TWELVE_MONTHS_MS = 365 * 24 * 60 * 60 * 1000;

interface Consent {
  essential: true;
  analytics: boolean;
  marketing: boolean;
  functionality: boolean;
  decidedAt: string;
}

function readConsent(): Consent | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Consent;
    const decidedAt = new Date(parsed.decidedAt).getTime();
    if (Number.isNaN(decidedAt) || Date.now() - decidedAt > TWELVE_MONTHS_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function saveConsent(consent: Omit<Consent, "essential" | "decidedAt">) {
  const value: Consent = {
    essential: true,
    ...consent,
    decidedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

function subscribe() {
  // consentimento não muda por eventos externos dentro da mesma aba;
  // a store é reavaliada a cada render normal do React.
  return () => {};
}

function getSnapshot() {
  return readConsent() === null;
}

function getServerSnapshot() {
  return false;
}

export function CookieConsentBanner() {
  const consentMissing = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const [customizing, setCustomizing] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);
  const [functionality, setFunctionality] = useState(true);

  if (!consentMissing || dismissed) return null;

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true, functionality: true });
    setDismissed(true);
  }

  function rejectOptional() {
    saveConsent({ analytics: false, marketing: false, functionality: false });
    setDismissed(true);
  }

  function savePreferences() {
    saveConsent({ analytics, marketing, functionality });
    setDismissed(true);
  }

  return (
    <div
      role="dialog"
      aria-label="Preferências de cookies"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-hairline bg-surface"
    >
      <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6">
        {!customizing ? (
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <p className="text-sm text-ink-dim">
              Utilizamos cookies essenciais e, mediante seu consentimento,
              cookies analíticos e de marketing, conforme a Lei nº
              13.709/2018 (LGPD). Saiba mais na nossa{" "}
              <Link href="/politica-de-privacidade" className="text-gold underline">
                Política de Privacidade
              </Link>
              .
            </p>
            <div className="flex shrink-0 flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setCustomizing(true)}>
                Personalizar
              </Button>
              <Button variant="secondary" onClick={rejectOptional}>
                Recusar opcionais
              </Button>
              <Button variant="primary" onClick={acceptAll}>
                Aceitar
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <p className="text-sm text-ink-dim">
              Escolha quais categorias de cookies deseja permitir.
            </p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
              <label className="flex items-center gap-2 text-sm text-ink-dim opacity-60">
                <input type="checkbox" checked disabled />
                Essenciais (sempre ativos)
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                />
                Analíticos
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                />
                Marketing
              </label>
              <label className="flex items-center gap-2 text-sm text-ink">
                <input
                  type="checkbox"
                  checked={functionality}
                  onChange={(e) => setFunctionality(e.target.checked)}
                />
                Funcionalidade
              </label>
            </div>
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" onClick={() => setCustomizing(false)}>
                Voltar
              </Button>
              <Button variant="primary" onClick={savePreferences}>
                Salvar preferências
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
