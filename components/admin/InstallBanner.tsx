"use client";

import { useState, useSyncExternalStore } from "react";
import { X } from "lucide-react";
import {
  triggerInstallPrompt,
  useInstallPromptAvailable,
  useIOSInstallable,
} from "@/lib/pwa-install";

const STORAGE_KEY = "pwa-install-banner-dismissed";
const DISMISS_EVENT = "pwa-install-banner-dismiss-change";

function subscribe(callback: () => void) {
  window.addEventListener(DISMISS_EVENT, callback);
  return () => window.removeEventListener(DISMISS_EVENT, callback);
}

function getDismissedSnapshot(): boolean {
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function getDismissedServerSnapshot(): boolean {
  return true;
}

function dismiss() {
  window.localStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event(DISMISS_EVENT));
}

export function InstallBanner() {
  const promptAvailable = useInstallPromptAvailable();
  const iosInstallable = useIOSInstallable();
  const dismissed = useSyncExternalStore(subscribe, getDismissedSnapshot, getDismissedServerSnapshot);
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (dismissed || (!promptAvailable && !iosInstallable)) return null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hairline bg-bg-alt px-4 py-2.5 print:hidden">
      <p className="text-xs text-ink-dim">
        {showIOSInstructions
          ? "Toque em compartilhar e selecione Adicionar à Tela de Início."
          : "Use o painel como aplicativo no seu computador."}
      </p>
      <div className="flex items-center gap-3">
        {!showIOSInstructions && (
          <button
            type="button"
            onClick={() => (promptAvailable ? triggerInstallPrompt() : setShowIOSInstructions(true))}
            className="border border-gold px-3 py-1 text-xs text-gold transition-colors duration-150 hover:bg-gold hover:text-bg"
          >
            Instalar
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dispensar aviso de instalação"
          className="text-ink-dim transition-colors duration-150 hover:text-gold"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
