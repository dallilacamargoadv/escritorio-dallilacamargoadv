import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { getNewLeadsCount } from "@/lib/db-admin";

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const newLeadsCount = await getNewLeadsCount().catch(() => 0);

  return (
    <div className="flex min-h-screen-safe">
      <AdminSidebar newLeadsCount={newLeadsCount} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
