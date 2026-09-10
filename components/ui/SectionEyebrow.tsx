export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6" aria-hidden={false}>
      <span className="h-px flex-1 bg-hairline" />
      <div className="flex items-center gap-3 shrink-0">
        <span aria-hidden="true" className="text-2xl leading-none text-gold">
          ✦
        </span>
        <span className="font-eyebrow text-gold text-base">{children}</span>
      </div>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}
