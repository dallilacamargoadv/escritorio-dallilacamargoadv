import type { ReactNode } from "react";

// Componentes usados dentro do conteúdo (MDX) dos posts do blog. Estilos em
// app/globals.css, bloco "Componentes de artigo". O editor rich-text do painel
// (html: false) não preserva estas tags: posts que usam estes componentes
// devem ser editados direto no conteúdo, não pelo editor.

export function Clausulas({ children }: { children: ReactNode }) {
  return <div className="post-clausulas">{children}</div>;
}

export function Clausula({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <div className="post-clausula">
      <strong>{titulo}</strong>
      {children}
    </div>
  );
}

export function Nota({
  titulo,
  children,
}: {
  titulo: string;
  children: ReactNode;
}) {
  return (
    <aside className="post-nota">
      <span className="post-nota__titulo">{titulo}</span>
      {children}
    </aside>
  );
}

export function Fluxograma({
  titulo,
  legenda,
  children,
}: {
  titulo: string;
  legenda?: string;
  children: ReactNode;
}) {
  return (
    <figure className="post-fluxo" role="group" aria-label={titulo}>
      <p className="post-fluxo__titulo">{titulo}</p>
      <div className="post-fluxo__lista">{children}</div>
      {legenda && <figcaption>{legenda}</figcaption>}
    </figure>
  );
}

export function Passo({
  tipo,
  detalhe,
  children,
}: {
  tipo?: "pergunta" | "final";
  detalhe?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`post-fluxo__item post-fluxo__passo${
        tipo ? ` post-fluxo__passo--${tipo}` : ""
      }`}
    >
      {children}
      {detalhe && <small>{detalhe}</small>}
    </div>
  );
}

export function Ramos({ children }: { children: ReactNode }) {
  return <div className="post-fluxo__item post-fluxo__ramos">{children}</div>;
}

export function Ramo({
  rotulo,
  children,
}: {
  rotulo: string;
  children: ReactNode;
}) {
  return (
    <div className="post-fluxo__ramo">
      <span className="post-fluxo__chip">{rotulo}</span>
      <div className="post-fluxo__passo">{children}</div>
    </div>
  );
}

export const postMdxComponents = {
  Clausulas,
  Clausula,
  Nota,
  Fluxograma,
  Passo,
  Ramos,
  Ramo,
};
