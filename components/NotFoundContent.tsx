import { Button } from "@/components/ui/Button";

export function NotFoundContent() {
  return (
    <section className="mx-auto flex min-h-[60vh] max-w-2xl flex-col items-center justify-center px-4 py-28 text-center sm:px-6">
      <span className="font-eyebrow text-[10px] text-gold">Erro 404</span>
      <h1 className="mt-4 text-4xl sm:text-5xl">Página não encontrada.</h1>
      <p className="mt-6 max-w-md text-base leading-relaxed text-ink-dim">
        O endereço acessado não existe ou foi movido. Você pode voltar para
        a página inicial ou consultar nossas áreas de atuação.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        <Button href="/">Voltar para a Home</Button>
        <Button href="/#areas-de-atuacao" variant="secondary">
          Áreas de Atuação
        </Button>
      </div>
    </section>
  );
}
