"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
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

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="flex min-h-screen-safe items-center justify-center px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm border border-hairline bg-surface p-8"
      >
        <Logo />
        <p className="mt-4 font-eyebrow text-[10px] text-gold">
          Painel Admin
        </p>

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
              className="mt-2 w-full border border-hairline-strong bg-bg p-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
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
              className="mt-2 w-full border border-hairline-strong bg-bg p-3 text-sm text-ink outline-none transition-colors duration-150 focus:border-gold"
            />
          </div>
        </div>

        {error && (
          <p role="alert" className="mt-4 text-sm text-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full"
        >
          {isSubmitting ? "Entrando..." : "Entrar"}
        </Button>
      </form>
    </div>
  );
}
