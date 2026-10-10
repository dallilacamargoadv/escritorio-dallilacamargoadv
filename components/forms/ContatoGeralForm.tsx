"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getUtms } from "@/lib/utms";
import { getClientMetadata, type ClientMetadata } from "@/lib/metadata";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { trackLead } from "@/lib/tracking";

const MIN_RELATO = 10;
const MAX_RELATO = 2000;

const FIELD_CLASS =
  "mt-2 w-full border border-hairline-strong bg-transparent p-3 text-base text-ink outline-none transition-colors duration-150 focus:border-gold";

/**
 * Formulário geral da página /contato: a pessoa conta o que aconteceu sem
 * precisar saber a área. Não redireciona pro WhatsApp — quem chama é a
 * Dallila, então o número dela não precisa aparecer aqui.
 */
export function ContatoGeralForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [relato, setRelato] = useState("");
  const [utms] = useState<Record<string, string>>(() => getUtms());
  const [browserMetadata] = useState<ClientMetadata>(() => getClientMetadata());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidName(name)) {
      setError("Digite seu nome completo (nome e sobrenome).");
      return;
    }
    if (!isValidWhatsapp(whatsapp)) {
      setError("Digite um WhatsApp válido, com DDD.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Digite um e-mail válido.");
      return;
    }
    if (relato.trim().length < MIN_RELATO) {
      setError("Conte um pouco do que aconteceu.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/contato-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          whatsapp,
          relato,
          utms,
          metadata: browserMetadata,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao enviar");

      if (data?._eventId) {
        trackLead({
          eventId: data._eventId,
          contentName: "Contato geral",
          value: data._value ?? 0,
        });
      }
      setSent(true);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center border border-hairline-strong px-6 py-12 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-hairline-strong">
          <CheckCircle2 className="h-8 w-8 text-gold" />
        </div>
        <p className="max-w-md text-xl text-ink">Recebi o seu relato.</p>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-ink-dim">
          Vou ler com calma e te chamo pelo WhatsApp que você informou para
          entender o caso e explicar os próximos passos.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-hairline-strong p-6 sm:p-8"
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <label className="block text-sm text-ink-dim">
          Seu nome
          <input
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={FIELD_CLASS}
          />
        </label>
        <label className="block text-sm text-ink-dim">
          Seu WhatsApp
          <input
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className={FIELD_CLASS}
          />
        </label>
      </div>

      <label className="mt-5 block text-sm text-ink-dim">
        Seu melhor e-mail
        <input
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="off"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={FIELD_CLASS}
        />
      </label>

      <label className="mt-5 block text-sm text-ink-dim">
        O que aconteceu? (pode ser breve)
        <textarea
          rows={4}
          maxLength={MAX_RELATO}
          value={relato}
          onChange={(e) => setRelato(e.target.value)}
          className={FIELD_CLASS}
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 text-sm text-wine">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-gold px-6 py-3 text-sm font-medium text-bg transition-all duration-150 ease-out active:scale-[0.97] disabled:opacity-60"
        >
          {isSubmitting ? "Enviando…" : "Enviar meu relato"}
        </button>
        <p className="text-xs text-ink-dim">
          Seus dados ficam só com o escritório e não são publicados.
        </p>
      </div>
    </form>
  );
}
