import Image from "next/image";

export function AdminPageBanner({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-center gap-5 bg-bg-alt px-6 py-6 sm:px-8">
      <Image
        src="/logo-abelha.png"
        alt=""
        width={48}
        height={48}
        aria-hidden="true"
        className="h-12 w-12 shrink-0"
      />
      <div className="h-11 w-px shrink-0 bg-hairline-strong" />
      <div>
        <h1 className="text-2xl italic text-ink">{title}</h1>
        <p className="mt-1.5 font-mono text-[10px] uppercase tracking-wide text-ink-dim">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
