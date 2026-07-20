export function CollapsibleSection({
  title,
  defaultOpen,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6">
      <details
        className="border border-hairline-strong bg-surface"
        open={defaultOpen}
      >
        <summary className="cursor-pointer list-none px-4 py-3 text-sm text-ink marker:content-none [&::-webkit-details-marker]:hidden">
          {title}
        </summary>
        <div className="border-t border-hairline">{children}</div>
      </details>
    </div>
  );
}
