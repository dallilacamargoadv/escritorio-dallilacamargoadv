import type { Metadata, Viewport } from "next";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { InstallBanner } from "@/components/admin/InstallBanner";
import { ServiceWorkerRegister } from "@/components/admin/ServiceWorkerRegister";
import { getNewLeadsCount } from "@/lib/db-admin";
import { getUnreadNotificacoesCount } from "@/lib/db-notificacoes";
import { getUrgentAtividadesCount } from "@/lib/db-atividades";

export const metadata: Metadata = {
  manifest: "/manifest-admin.webmanifest",
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Painel DC",
  },
};

export const viewport: Viewport = {
  themeColor: "#2a070c",
};

export default async function AdminAreaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [newLeadsCount, unreadNotificacoesCount, urgentAtividadesCount] = await Promise.all([
    getNewLeadsCount().catch(() => 0),
    getUnreadNotificacoesCount().catch(() => 0),
    getUrgentAtividadesCount().catch(() => 0),
  ]);

  return (
    <>
      <ServiceWorkerRegister />
      <InstallBanner />
      <div className="flex min-h-screen-safe">
        <AdminSidebar
          newLeadsCount={newLeadsCount}
          unreadNotificacoesCount={unreadNotificacoesCount}
          urgentAtividadesCount={urgentAtividadesCount}
        />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </>
  );
}
