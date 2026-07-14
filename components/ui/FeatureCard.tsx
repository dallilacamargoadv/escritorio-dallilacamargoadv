import Link from "next/link";
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
    </>
  );

  const className =
    "block border border-hairline p-6 transition-colors duration-150 hover:border-gold";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
