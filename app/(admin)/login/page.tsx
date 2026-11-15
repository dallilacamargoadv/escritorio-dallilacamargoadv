"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

type Etapa = "senha" | "codigo";

/** Retorna o id do app autenticador se a sessão ainda precisa do código. */
async function fatorPendente(
  supabase: ReturnType<typeof createClient>,
): Promise<string | null> {
  const { data: aal } =
    await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!aal || aal.nextLevel !== "aal2" || aal.currentLevel === "aal2") {
    return null;
  }
  const { data: fatores } = await supabase.auth.mfa.listFactors();
  return fatores?.totp[0]?.id ?? null;
}

export default function LoginPage() {
  const router = useRouter();
  const [etapa, setEtapa] = useState<Etapa>("senha");
  const [fatorId, setFatorId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sessão aberta só com a senha (ex.: voltou do proxy): vai direto ao código.
  useEffect(() => {
    const supabase = createClient();
    fatorPendente(supabase).then((id) => {
      if (id) {
        setFatorId(id);
        setEtapa("codigo");
      }
    });
  }, []);

  const entrar = () => {
    router.push("/admin");
    router.refresh();
  };

  const handleSenha = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError("E-mail ou senha inválidos.");
      setIsSubmitting(false);
      return;
    }

    const id = await fatorPendente(supabase);
    if (id) {
      setFatorId(id);
      setEtapa("codigo");
      setIsSubmitting(false);
      return;
    }

    entrar();
  };

  const handleCodigo = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError("");

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: fatorId,
      code: codigo.replace(/\D/g, ""),
    });

    if (verifyError) {
      setError("Código inválido ou vencido. Confira o app e tente de novo.");
      setCodigo("");
      setIsSubmitting(false);
      return;
    }

    entrar();
  };

  const voltar = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setEtapa("senha");
    setCodigo("");
    setError("");
  };

  const inputClass =
    "mt-2 w-full border border-hairline-strong bg-bg p-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold";

  return (
    <div className="flex min-h-screen-safe items-center justify-center px-4">
      <form
        onSubmit={etapa === "senha" ? handleSenha : handleCodigo}
        className="w-full max-w-sm border border-hairline bg-surface p-8"
      >
        <Logo />
        <p className="mt-4 font-eyebrow text-[10px] text-gold">
          Painel Admin
        </p>

        {etapa === "senha" ? (
          <div className="mt-8 space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs text-ink-dim">
                E-mail
              </label>
              <input
                id="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs text-ink-dim">
                Senha
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        ) : (
          <div className="mt-8">
            <label htmlFor="codigo" className="block text-xs text-ink-dim">
              Código de 6 dígitos do app autenticador
            </label>
            <input
              id="codigo"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9 ]{6,7}"
              maxLength={7}
              required
              autoFocus
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              className={`${inputClass} text-center font-mono text-lg tracking-[0.4em]`}
            />
          </div>
        )}

        {error && (
          <p role="alert" className="mt-4 text-sm text-error">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
          {etapa === "senha"
            ? isSubmitting
              ? "Entrando..."
              : "Entrar"
            : isSubmitting
              ? "Conferindo..."
              : "Confirmar código"}
        </Button>

        {etapa === "codigo" && (
          <button
            type="button"
            onClick={voltar}
            className="mt-4 w-full text-xs text-ink-dim underline-offset-4 hover:underline"
          >
            Sair e entrar com outra conta
          </button>
        )}
      </form>
    </div>
  );
}
