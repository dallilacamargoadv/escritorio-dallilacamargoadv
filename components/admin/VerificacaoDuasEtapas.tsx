"use client";

import { useCallback, useEffect, useState } from "react";
import { ShieldCheck, Smartphone, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

type Fator = { id: string; nome: string; criadoEm: string };
type Cadastro = { id: string; qr: string; segredo: string };

async function buscarFatores(): Promise<Fator[]> {
  const supabase = createClient();
  const { data } = await supabase.auth.mfa.listFactors();
  return (data?.totp ?? []).map((f) => ({
    id: f.id,
    nome: f.friendly_name || "App autenticador",
    criadoEm: f.created_at,
  }));
}

export function VerificacaoDuasEtapas() {
  const [fatores, setFatores] = useState<Fator[] | null>(null);
  const [cadastro, setCadastro] = useState<Cadastro | null>(null);
  const [nome, setNome] = useState("Celular");
  const [codigo, setCodigo] = useState("");
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [ocupado, setOcupado] = useState(false);

  const carregar = useCallback(async () => {
    setFatores(await buscarFatores());
  }, []);

  useEffect(() => {
    let vivo = true;
    buscarFatores().then((lista) => {
      if (vivo) setFatores(lista);
    });
    return () => {
      vivo = false;
    };
  }, []);

  const iniciar = async () => {
    setOcupado(true);
    setErro("");
    setAviso("");
    const supabase = createClient();

    // limpa cadastros que ficaram pela metade, para não acumular
    const { data: todos } = await supabase.auth.mfa.listFactors();
    for (const f of todos?.all ?? []) {
      if (f.status === "unverified") {
        await supabase.auth.mfa.unenroll({ factorId: f.id });
      }
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: `${nome.trim() || "App"} ${new Date().toLocaleDateString("pt-BR")}`,
      issuer: "Painel Dallila Camargo",
    });
    setOcupado(false);
    if (error || !data) {
      setErro("Não deu para iniciar o cadastro. Tente de novo em instantes.");
      return;
    }
    setCadastro({ id: data.id, qr: data.totp.qr_code, segredo: data.totp.secret });
  };

  const confirmar = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!cadastro) return;
    setOcupado(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.challengeAndVerify({
      factorId: cadastro.id,
      code: codigo.replace(/\D/g, ""),
    });
    setOcupado(false);
    if (error) {
      setErro("Código inválido ou vencido. Confira o app e tente de novo.");
      setCodigo("");
      return;
    }
    setCadastro(null);
    setCodigo("");
    setAviso(
      "Pronto. A partir de agora, o painel pede o código do app depois da senha.",
    );
    await carregar();
  };

  const cancelar = async () => {
    if (cadastro) {
      const supabase = createClient();
      await supabase.auth.mfa.unenroll({ factorId: cadastro.id });
    }
    setCadastro(null);
    setCodigo("");
    setErro("");
  };

  const remover = async (fator: Fator) => {
    const ultimo = (fatores?.length ?? 0) <= 1;
    const pergunta = ultimo
      ? `Remover "${fator.nome}"? Este é o único app cadastrado: o painel volta a pedir só a senha.`
      : `Remover "${fator.nome}"?`;
    if (!window.confirm(pergunta)) return;
    setOcupado(true);
    setErro("");
    const supabase = createClient();
    const { error } = await supabase.auth.mfa.unenroll({ factorId: fator.id });
    setOcupado(false);
    if (error) {
      setErro("Não deu para remover. Saia, entre de novo com o código e tente outra vez.");
      return;
    }
    await carregar();
  };

  const ativo = (fatores?.length ?? 0) > 0;

  return (
    <section className="mt-6 border border-hairline-strong bg-surface">
      <div className="flex items-center gap-3 border-b border-hairline px-4 py-3">
        <ShieldCheck size={18} className={ativo ? "text-gold" : "text-ink-dim"} />
        <h2 className="text-sm text-ink">Verificação em duas etapas</h2>
        <span className="ml-auto font-mono text-[10px] text-ink-dim">
          {fatores === null ? "…" : ativo ? "ATIVADA" : "DESATIVADA"}
        </span>
      </div>

      <div className="space-y-4 p-4 text-sm text-ink-dim">
        <p className="text-xs leading-relaxed">
          Depois da senha, o painel pede um código de 6 dígitos que muda a cada
          30 segundos no seu celular. Quem descobrir só a senha não entra, nem
          pelo site nem direto pelo banco de dados.
        </p>

        {fatores && fatores.length > 0 && (
          <ul className="divide-y divide-hairline border border-hairline">
            {fatores.map((f) => (
              <li key={f.id} className="flex items-center gap-3 px-3 py-2">
                <Smartphone size={16} className="text-ink-dim" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{f.nome}</p>
                  <p className="font-mono text-[10px]">
                    cadastrado em {new Date(f.criadoEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => remover(f)}
                  disabled={ocupado}
                  aria-label={`Remover ${f.nome}`}
                  className="p-2 text-ink-dim transition-colors hover:text-error disabled:opacity-50"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}

        {!cadastro && fatores !== null && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="nome-fator" className="block text-xs">
                Nome do aparelho
              </label>
              <input
                id="nome-fator"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                maxLength={30}
                className="mt-2 w-full border border-hairline-strong bg-bg p-3 text-sm text-ink outline-none focus:border-gold"
              />
            </div>
            <Button type="button" onClick={iniciar} disabled={ocupado}>
              {ativo ? "Cadastrar outro aparelho" : "Ativar"}
            </Button>
          </div>
        )}

        {cadastro && (
          <form onSubmit={confirmar} className="space-y-4 border border-hairline p-4">
            <ol className="list-decimal space-y-1 pl-4 text-xs leading-relaxed">
              <li>
                Abra um app autenticador no celular (Google Authenticator,
                Microsoft Authenticator ou o app Senhas do iPhone).
              </li>
              <li>Toque em adicionar e escaneie o QR code abaixo.</li>
              <li>Digite o código de 6 dígitos que aparecer no app.</li>
            </ol>
            {/* eslint-disable-next-line @next/next/no-img-element -- QR em data URL gerado pelo Supabase */}
            <img
              src={cadastro.qr}
              alt="QR code para o app autenticador"
              width={180}
              height={180}
              className="mx-auto bg-white p-2"
            />
            <details className="text-xs">
              <summary className="cursor-pointer">
                Está no próprio celular e não dá para escanear?
              </summary>
              <p className="mt-2">
                No app, escolha &quot;inserir chave&quot; e cole esta chave:
              </p>
              <p className="mt-1 select-all break-all font-mono text-ink">
                {cadastro.segredo}
              </p>
            </details>
            <div>
              <label htmlFor="codigo-cadastro" className="block text-xs">
                Código de 6 dígitos
              </label>
              <input
                id="codigo-cadastro"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={7}
                required
                value={codigo}
                onChange={(e) => setCodigo(e.target.value)}
                className="mt-2 w-full border border-hairline-strong bg-bg p-3 text-center font-mono text-lg tracking-[0.4em] text-ink outline-none focus:border-gold"
              />
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={ocupado} className="flex-1">
                {ocupado ? "Conferindo..." : "Confirmar"}
              </Button>
              <Button type="button" variant="secondary" onClick={cancelar} disabled={ocupado}>
                Cancelar
              </Button>
            </div>
          </form>
        )}

        {erro && (
          <p role="alert" className="text-sm text-error">
            {erro}
          </p>
        )}
        {aviso && <p className="text-sm text-gold">{aviso}</p>}

        <p className="border-l-2 border-hairline-strong pl-3 text-xs leading-relaxed">
          Dica: cadastre também um segundo aparelho (ex.: tablet ou o celular
          antigo). Se perder o celular, você entra pelo outro.
        </p>
      </div>
    </section>
  );
}
