import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TREINO from "@/content/estudos/treino-discursiva.json";
import { BOTAO_PRIMARIO, Cabecalho, Card, CardTitulo } from "@/components/estudos/ui";
import { TreinoDiscursivaClient, type ExercicioTreino } from "@/components/estudos/TreinoDiscursivaClient";

const PASSOS = [
  ["Ache o comando", "Grife o verbo da pergunta: \"é válido?\", \"é cabível?\", \"qual o recurso?\". Ele diz o que a primeira frase precisa responder."],
  ["Diga a tese", "Primeira frase: sim ou não, cabe ou não cabe. Sem rodeio. O examinador procura essa frase."],
  ["Dê o fundamento", "O nome do instituto e o artigo, com a parte da lei que resolve a questão."],
  ["Aplique e conclua", "Ligue a lei ao fato do caso (\"No caso, ...\") e feche com \"Logo, ...\"."],
];

export default function TreinoDiscursivaPage() {
  return (
    <>
      <Link href="/admin/estudos/redacao" className="mb-3 inline-flex items-center gap-1 text-xs text-e-dim hover:text-e-ink">
        <ArrowLeft size={13} aria-hidden="true" /> Redação
      </Link>
      <Cabecalho
        titulo="Treino de discursiva, do zero"
        sub="A FCC não quer uma redação bonita. Ela quer, em cada quesito, uma resposta clara, o artigo certo e o fato do caso. Treine um quesito por vez; escreva antes de abrir o espelho."
      />

      <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-e-dim">O método: 4 passos para cada quesito</h2>
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {PASSOS.map(([t, d], i) => (
          <Card key={t}>
            <p className="text-xs text-e-accent">passo {i + 1}</p>
            <p className="font-serif text-lg text-e-ink">{t}</p>
            <p className="text-sm text-e-dim">{d}</p>
          </Card>
        ))}
      </div>

      <Card className="mb-4">
        <CardTitulo>O molde da resposta</CardTitulo>
        <div className="overflow-x-auto rounded-lg bg-e-card-2 px-3 py-2 font-mono text-[13px] leading-7 text-e-ink">
          <p><span className="text-e-accent">Tese:</span> Não/Sim, [resposta direta ao comando].</p>
          <p><span className="text-e-accent">Fundamento:</span> Isso porque [instituto], nos termos do art. X da [lei], que [o que a lei diz].</p>
          <p><span className="text-e-accent">Aplicação:</span> No caso, [o fato do enunciado que se encaixa na regra].</p>
          <p><span className="text-e-accent">Conclusão:</span> Logo, [o que acontece: é nulo, não incide, cabe tal recurso].</p>
        </div>
        <p className="mt-2 text-xs text-e-dim">Quesito isolado: 5 a 8 linhas. No estudo de caso de 4 quesitos e 30 linhas, mais ou menos 7 linhas por quesito.</p>
      </Card>

      <Card className="mb-6">
        <CardTitulo>Exemplo: resposta fraca × resposta boa</CardTitulo>
        <p className="font-serif text-[15px] text-e-ink">
          <span className="text-e-dim">PGE-AM 2022, quesito c.</span> Uma tempestade derrubou uma árvore íntegra e sadia do parque estadual sobre o food truck da permissionária, que pede indenização. <b>Qual o mérito da contestação do Estado?</b>
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <div className="rounded-xl bg-e-bad-soft p-3 text-sm text-e-ink">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-e-bad">Fraca</p>
            <p className="mt-1">&quot;O Estado responde de forma objetiva pelos danos que seus agentes causarem, conforme a Constituição. Porém, deve-se analisar o caso concreto, pois existem exceções.&quot;</p>
            <ul className="mt-2 list-disc pl-5 text-[13px] text-e-dim">
              <li>Não responde ao comando: qual é a defesa?</li>
              <li>Cita a regra que favorece a empresa.</li>
              <li>Não usa nenhum fato do caso.</li>
              <li>Sem conclusão.</li>
            </ul>
          </div>
          <div className="rounded-xl bg-e-ok-soft p-3 text-sm text-e-ink">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-e-ok">Boa</p>
            <p className="mt-1">
              Não há responsabilidade do Estado. A queda da árvore é uma omissão, e na omissão o Estado responde quando há falha do serviço. Além disso, caso fortuito ou força maior rompe o nexo causal. No caso, a árvore era íntegra e sadia e caiu por uma tempestade, sem falha de manutenção. Logo, o pedido deve ser julgado improcedente.
            </p>
            <ul className="mt-2 list-disc pl-5 text-[13px] text-e-dim">
              <li>Tese na primeira frase.</li>
              <li>Instituto: omissão e excludente do nexo.</li>
              <li>Usa os dois fatos que a banca pôs de propósito.</li>
              <li>Fecha com o pedido.</li>
            </ul>
          </div>
        </div>
      </Card>

      <h2 className="mb-3 text-sm font-medium uppercase tracking-[0.12em] text-e-dim">Agora você: quesitos isolados</h2>
      <TreinoDiscursivaClient exercicios={TREINO.exercicios as ExercicioTreino[]} />

      <Card destaque className="mt-6">
        <CardTitulo>Depois dos 4: o estudo de caso inteiro</CardTitulo>
        <p className="text-sm text-e-dim">O caso da PGE-AM 2022 (food truck no parque) com os 4 quesitos, 20 a 30 linhas e espelho com nota.</p>
        <Link href="/admin/estudos/redacao/discursiva/adm-bem-publico-food-truck" className={`mt-3 ${BOTAO_PRIMARIO}`}>
          Fazer o caso da PGE-AM
        </Link>
      </Card>
      <p className="mt-3 text-[11px] text-e-dim">Lei seca conferida nos textos vigentes (CF e CPC) em 23/11/2026. O rascunho dos quesitos isolados fica salvo neste navegador.</p>
    </>
  );
}
