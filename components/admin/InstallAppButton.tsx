"use client";

import { useState } from "react";
import { Download, Share, X } from "lucide-react";
import { triggerInstallPrompt, useInstallPromptAvailable, useIOSInstallable } from "@/lib/pwa-install";

function IOSInstructionsModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-hairline bg-surface"
        role="dialog"
        aria-modal="true"
        aria-label="Instalar app no iOS"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="text-[15px] italic text-ink">Instalar app</p>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-dim transition-colors duration-150 hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex items-start gap-3 px-5 py-5">
          <Share size={18} className="mt-0.5 shrink-0 text-gold" />
          <p className="text-sm text-ink-dim">
            Toque em <span className="text-ink">compartilhar</span> e selecione{" "}
            <span className="text-ink">Adicionar à Tela de Início</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

export function InstallAppButton() {
  const promptAvailable = useInstallPromptAvailable();
  const iosInstallable = useIOSInstallable();
  const [showIOSInstructions, setShowIOSInstructions] = useState(false);

  if (!promptAvailable && !iosInstallable) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => (promptAvailable ? triggerInstallPrompt() : setShowIOSInstructions(true))}
        className="flex items-center gap-2 border border-hairline-strong px-3 py-2.5 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
      >
        <Download size={14} /> Instalar app
      </button>

      {showIOSInstructions && (
        <IOSInstructionsModal onClose={() => setShowIOSInstructions(false)} />
      )}
    </>
  );
}
