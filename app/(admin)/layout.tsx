import type { Metadata } from "next";

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
    <div className="min-h-screen-safe flex-1 bg-neutral-950 font-sans text-neutral-100">
      {children}
    </div>
  );
}
