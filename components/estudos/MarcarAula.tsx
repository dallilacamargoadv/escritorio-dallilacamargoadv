"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkle } from "@/components/estudos/Sparkle";

export function MarcarAula({ aulaId, estudada }: { aulaId: string; estudada: boolean }) {
  const router = useRouter();
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  async function alternar() {
    setSalvando(true);
    setErro(null);
    const res = await fetch(`/api/admin/estudos/aulas/${aulaId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ estudada: !estudada }),
    });
    setSalvando(false);
    if (!res.ok) {
      setErro("Não consegui salvar agora. Tente de novo.");
      return;
    }
    router.refresh();
  }
  return (
    <span className="inline-flex flex-col">
      <button
        type="button"
        onClick={alternar}
        disabled={salvando}
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium disabled:opacity-60 ${estudada ? "border border-e-ok/60 bg-e-ok-soft text-e-ok" : "bg-e-glow text-e-bg"}`}
      >
        {salvando && <Sparkle size={14} variante="carregando" cor="currentColor" />}
        {estudada ? "Aula estudada ✓ (desmarcar)" : "Marcar aula como estudada"}
      </button>
      {erro && <span role="alert" className="mt-1 text-xs text-e-bad">{erro}</span>}
    </span>
  );
}
