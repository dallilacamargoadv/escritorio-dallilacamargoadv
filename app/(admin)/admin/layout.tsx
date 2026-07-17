import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getNewLeadsCount } from "@/lib/db-admin";
import { getUnreadNotificacoesCount } from "@/lib/db-notificacoes";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newLeadsCount, unreadNotificacoesCount] = await Promise.all([
    getNewLeadsCount().catch(() => 0),
    getUnreadNotificacoesCount().catch(() => 0),
  ]);

  return (
    <div className="flex min-h-screen-safe">
      <AdminSidebar
        newLeadsCount={newLeadsCount}
        unreadNotificacoesCount={unreadNotificacoesCount}
      />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
