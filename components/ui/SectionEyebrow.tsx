import Image from "next/image";

export function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 mb-6" aria-hidden={false}>
      <span className="h-px flex-1 bg-hairline" />
      <div className="flex items-center gap-3 shrink-0">
        <Image
          src="/logo-abelha.png"
          width={20}
          height={20}
          alt=""
          aria-hidden="true"
          className="h-5 w-5 opacity-80"
        />
        <span className="font-eyebrow text-gold text-[10px]">{children}</span>
      </div>
      <span className="h-px flex-1 bg-hairline" />
    </div>
  );
}
