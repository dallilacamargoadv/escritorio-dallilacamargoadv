"use client";

import { X } from "lucide-react";

export function NovoLancamentoPessoalChoiceModal({
  onClose,
  onEscolherReceita,
  onEscolherDespesa,
}: {
  onClose: () => void;
  onEscolherReceita: () => void;
  onEscolherDespesa: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm border border-hairline bg-surface"
        role="dialog"
        aria-modal="true"
        aria-label="Novo lançamento pessoal"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
          <p className="text-[15px] italic text-ink">Novo lançamento</p>
          <button
            type="button"
            onClick={onClose}
            className="text-ink-dim transition-colors duration-150 hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3 p-5">
          <button
            type="button"
            onClick={onEscolherReceita}
            className="border border-gold px-4 py-6 text-center text-sm text-gold transition-colors duration-150 hover:bg-gold hover:text-bg"
          >
            Receita
          </button>
          <button
            type="button"
            onClick={onEscolherDespesa}
            className="border border-hairline-strong px-4 py-6 text-center text-sm text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
          >
            Despesa
          </button>
        </div>
      </div>
    </div>
  );
}
