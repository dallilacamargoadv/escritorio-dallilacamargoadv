"use client";

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="border border-gold bg-gold px-4 py-2 text-sm text-bg transition-all duration-150 hover:bg-transparent hover:text-gold"
    >
      Salvar como PDF
    </button>
  );
}
