import { CronometroEstudo } from "@/components/estudos/CronometroEstudo";

export default function EstudosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-e-bg font-sans text-e-ink">
      <div className="mx-auto max-w-6xl px-4 pb-36 pt-7 sm:px-6">{children}</div>
      <CronometroEstudo />
    </div>
  );
}
