import type { Metadata } from "next";
import { ThemeToggle } from "@/components/ThemeToggle";

export const metadata: Metadata = {
  title: "Painel Admin",
  robots: { index: false, follow: false },
};

export default function AdminGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen-safe flex-1 bg-bg font-sans text-ink">
      {children}
      <ThemeToggle />
    </div>
  );
}
