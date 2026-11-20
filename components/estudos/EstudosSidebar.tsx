"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Library, CalendarDays, CalendarRange, CircleHelp, FlaskConical, Languages, Layers, Puzzle, LayoutDashboard, ListChecks, LogOut, ChartColumn, PenLine, Repeat, Sun, Target, Timer } from "lucide-react";
import { ModoSwitch } from "@/components/admin/ModoSwitch";
import { InstallAppButton } from "@/components/admin/InstallAppButton";
import { Sparkle } from "@/components/estudos/Sparkle";

const ITENS = [
  { href: "/admin/estudos", label: "Início", icon: LayoutDashboard, exact: true },
  { href: "/admin/estudos/revisao", label: "Revisão", icon: Repeat, exact: false },
  { href: "/admin/estudos/cronograma", label: "Cronograma", icon: CalendarDays, exact: false },
  { href: "/admin/estudos/cadernos", label: "Cadernos", icon: BookOpen, exact: false },
  { href: "/admin/estudos/flashcards", label: "Flashcards", icon: Layers, exact: false },
  { href: "/admin/estudos/leitura", label: "Leitura diária", icon: Sun, exact: false },
  { href: "/admin/estudos/verbos", label: "Treino de verbos", icon: Languages, exact: false },
  { href: "/admin/estudos/questoes", label: "Questões", icon: CircleHelp, exact: false },
  { href: "/admin/estudos/simulados", label: "Simulados", icon: Timer, exact: false },
  { href: "/admin/estudos/desafios", label: "Desafios", icon: Puzzle, exact: false },
  { href: "/admin/estudos/redacao", label: "Redação", icon: PenLine, exact: false },
  { href: "/admin/estudos/biblioteca", label: "Biblioteca", icon: Library, exact: false },
  { href: "/admin/estudos/relatorio", label: "Relatório quinzenal", icon: ChartColumn, exact: false },
  { href: "/admin/estudos/laboratorio", label: "Laboratório de erros", icon: FlaskConical, exact: false },
  { href: "/admin/estudos/banca", label: "Banca FCC", icon: Target, exact: false },
  { href: "/admin/estudos/edital", label: "Edital", icon: ListChecks, exact: false },
  { href: "/admin/estudos/concurso", label: "Concurso", icon: CalendarRange, exact: false },
];

export function EstudosSidebar({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-e-line bg-e-side px-3 py-5 font-sans print:hidden">
      <Link href="/admin/estudos" className="flex items-center gap-2 px-2">
        <Sparkle size={22} variante="brilhante" />
        <span className="text-xs font-medium tracking-[0.14em] text-e-ink">OPERAÇÃO APROVAÇÃO</span>
      </Link>
      <div className="mt-5 px-1">
        <ModoSwitch modo="estudos" />
      </div>
      <nav aria-label="Estudos" className="mt-6 flex flex-1 flex-col gap-0.5">
        {ITENS.map((item) => {
          const ativo = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={ativo ? "page" : undefined}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition-colors duration-150 ${
                ativo ? "bg-e-accent-soft text-e-ink" : "text-e-dim hover:bg-e-card hover:text-e-ink"
              }`}
            >
              {ativo ? <Sparkle size={14} /> : <Icon size={15} aria-hidden="true" />}
              {item.label}
            </Link>
          );
        })}
        <p className="mt-6 px-3 text-[10px] uppercase tracking-[0.14em] text-e-dim">Nas próximas etapas</p>
        {["Jornada"].map((t) => (
          <span key={t} className="px-3 py-1.5 text-xs text-e-dim/60">
            {t}
          </span>
        ))}
      </nav>
      <div className="flex flex-col gap-2">
        <InstallAppButton />
        <button
          type="button"
          onClick={onLogout}
          className="flex items-center gap-2 rounded-lg border border-e-line px-3 py-2.5 text-xs text-e-dim transition-colors duration-150 hover:text-e-ink"
        >
          <LogOut size={14} aria-hidden="true" /> Sair
        </button>
      </div>
    </aside>
  );
}
