"use client";

import Link from "next/link";
import { X } from "lucide-react";

export function QuickViewModal({
  title,
  subtitle,
  footerHref,
  footerLabel,
  onClose,
  children,
}: {
  title: string;
  subtitle: string;
  footerHref?: string;
  footerLabel?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[85vh] w-full max-w-lg flex-col border border-hairline bg-surface"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-hairline px-5 py-4">
          <div className="min-w-0">
            <p className="text-[15px] italic text-ink">{title}</p>
            <p className="mt-0.5 font-mono text-[10px] text-ink-dim">{subtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 text-ink-dim transition-colors duration-150 hover:text-gold"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">{children}</div>

        {footerHref && (
          <div className="border-t border-hairline px-5 py-3">
            <Link
              href={footerHref}
              className="font-mono text-[10px] text-gold transition-colors duration-150 hover:underline"
            >
              {footerLabel ?? "ver todos →"}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export function QuickViewRow({
  href,
  onClick,
  label,
  meta,
  pill,
  pillClassName,
}: {
  href?: string;
  onClick?: () => void;
  label: string;
  meta?: string;
  pill?: string;
  pillClassName?: string;
}) {
  const content = (
    <>
      <div className="min-w-0">
        <p className="truncate text-ink">{label}</p>
        {meta && <p className="mt-0.5 truncate font-mono text-[10px] text-ink-dim">{meta}</p>}
      </div>
      {pill && (
        <span
          className={`shrink-0 border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wide ${pillClassName ?? "border-hairline-strong text-ink-dim"}`}
        >
          {pill}
        </span>
      )}
    </>
  );

  const className =
    "flex items-center justify-between gap-3 border-b border-hairline px-5 py-3 text-sm transition-colors duration-150 last:border-b-0 hover:bg-bg-alt";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={`w-full text-left ${className}`}>
      {content}
    </button>
  );
}

export function QuickViewEmpty({ label }: { label: string }) {
  return <p className="px-5 py-8 text-center text-sm text-ink-dim">{label}</p>;
}
