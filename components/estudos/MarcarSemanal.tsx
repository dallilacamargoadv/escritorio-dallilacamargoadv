"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { BOTAO_SECUNDARIO } from "@/components/estudos/ui";

/** Marca o desafio semanal de hoje como feito (ou desfaz). */
export function MarcarSemanal({ tipo, feito }: { tipo: string; feito: boolean }) {
  const [ok, setOk] = useState(feito);
  const [salvando, setSalvando] = useState(false);
  const router = useRouter();
  async function alternar() {
    setSalvando(true);
    const res = await fetch("/api/admin/estudos/redacao", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ acao: "semanal", tipo, feito: !ok }),
    });
    setSalvando(false);
    if (res.ok) {
      setOk(!ok);
      router.refresh();
    }
  }
  return (
    <button type="button" onClick={alternar} disabled={salvando} className={`${BOTAO_SECUNDARIO} ${ok ? "border-e-ok text-e-ok" : ""}`}>
      <Check size={13} aria-hidden="true" /> {ok ? "Feito hoje" : "Marcar como feito"}
    </button>
  );
}
