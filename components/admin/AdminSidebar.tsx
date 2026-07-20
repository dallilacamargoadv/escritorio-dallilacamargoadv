"use client";

import { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutGrid,
  Users,
  UserSquare2,
  Briefcase,
  FileText,
  Newspaper,
  Wallet,
  Repeat,
  ListChecks,
  TrendingUp,
  Target,
  Link2,
  FileBarChart,
  Bell,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { createClient } from "@/lib/supabase/client";
import { JuridicoAreaSubnav } from "@/components/admin/JuridicoAreaSubnav";
import { InstallAppButton } from "@/components/admin/InstallAppButton";

export function AdminSidebar({
  newLeadsCount,
  unreadNotificacoesCount,
  urgentAtividadesCount,
}: {
  newLeadsCount: number;
  unreadNotificacoesCount: number;
  urgentAtividadesCount: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  const NAV_GROUPS = [
    {
      label: "Operação",
      items: [
        { href: "/admin", label: "Visão Geral", icon: LayoutGrid, exact: true, badge: 0 },
        { href: "/admin/leads", label: "Leads", icon: Users, exact: false, badge: newLeadsCount },
        {
          href: "/admin/analise-aprofundada",
          label: "Análise Aprofundada",
          icon: TrendingUp,
          exact: false,
          badge: 0,
        },
      ],
    },
    {
      label: "Atividades",
      items: [
        {
          href: "/admin/atividades",
          label: "Atividades",
          icon: ListChecks,
          exact: false,
          badge: urgentAtividadesCount,
        },
      ],
    },
    {
      label: "Jurídico",
      items: [
        { href: "/admin/clientes", label: "Clientes", icon: UserSquare2, exact: false, badge: 0 },
        { href: "/admin/casos", label: "Casos", icon: Briefcase, exact: false, badge: 0 },
        { href: "/admin/relatorios", label: "Relatórios", icon: FileBarChart, exact: false, badge: 0 },
      ],
      areaSubnav: true,
    },
    {
      label: "Finanças",
      items: [
        { href: "/admin/contratos", label: "Contratos", icon: FileText, exact: false, badge: 0 },
        { href: "/admin/recorrentes", label: "Recorrentes", icon: Repeat, exact: false, badge: 0 },
        { href: "/admin/financeiro", label: "Financeiro", icon: Wallet, exact: false, badge: 0 },
        { href: "/admin/metas", label: "Metas", icon: Target, exact: false, badge: 0 },
      ],
    },
    {
      label: "Sistema",
      items: [
        { href: "/admin/blog", label: "Blog", icon: Newspaper, exact: false, badge: 0 },
        { href: "/admin/links", label: "Links", icon: Link2, exact: false, badge: 0 },
        {
          href: "/admin/notificacoes",
          label: "Notificações",
          icon: Bell,
          exact: false,
          badge: unreadNotificacoesCount,
        },
      ],
    },
  ];

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <aside className="flex w-56 shrink-0 flex-col border-r border-hairline px-4 py-6 print:hidden">
      <Link href="/admin" className="px-2">
        <Logo />
      </Link>

      <nav className="mt-10 flex flex-1 flex-col gap-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 pb-1 font-eyebrow text-[10px] text-ink-dim">
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map((item) => {
                const active = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between gap-2 px-3 py-2.5 text-sm transition-colors duration-150 ${
                      active
                        ? "border-l-2 border-gold bg-bg-alt text-gold"
                        : "border-l-2 border-transparent text-ink-dim hover:text-gold"
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Icon size={15} />
                      {item.label}
                    </span>
                    {item.badge > 0 && (
                      <span className="font-mono text-[10px] text-bg bg-gold px-1.5 py-0.5">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
              {group.areaSubnav && (
                <Suspense fallback={null}>
                  <JuridicoAreaSubnav />
                </Suspense>
              )}
            </div>
          </div>
        ))}
      </nav>

      <div className="flex flex-col gap-2">
        <InstallAppButton />
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 border border-hairline-strong px-3 py-2.5 text-xs text-ink-dim transition-colors duration-150 hover:border-gold hover:text-gold"
        >
          <LogOut size={14} /> Sair
        </button>
      </div>
    </aside>
  );
}
