import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Icon, type IconName } from "@/components/ui/Icon";

export function FeatureCard({
  icon,
  number,
  title,
  description,
  href,
}: {
  icon: IconName;
  number: string;
  title: string;
  description: string;
  href?: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <Icon name={icon} />
        <span className="font-mono text-xs text-ink-dim tabular-nums">
          {number}
        </span>
      </div>
      <h3 className="mt-6 font-display text-lg font-normal not-italic text-ink">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-dim">
        {description}
      </p>
      {href && (
        <ArrowUpRight
          size={14}
          className="absolute bottom-6 right-6 text-ink-dim/40 transition-all duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-gold"
        />
      )}
    </>
  );

  const className =
    "group relative block border border-hairline p-6 transition-colors duration-150 hover:border-gold";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
