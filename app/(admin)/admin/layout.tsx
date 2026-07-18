import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getNewLeadsCount } from "@/lib/db-admin";
import { getUnreadNotificacoesCount } from "@/lib/db-notificacoes";
import { getUrgentPrazosCount } from "@/lib/db-prazos";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newLeadsCount, unreadNotificacoesCount, urgentPrazosCount] = await Promise.all([
    getNewLeadsCount().catch(() => 0),
    getUnreadNotificacoesCount().catch(() => 0),
    getUrgentPrazosCount().catch(() => 0),
  ]);

  return (
    <div className="flex min-h-screen-safe">
      <AdminSidebar
        newLeadsCount={newLeadsCount}
        unreadNotificacoesCount={unreadNotificacoesCount}
        urgentPrazosCount={urgentPrazosCount}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
