import { Reveal } from "@/components/ui/Reveal";
import { SectionEyebrow } from "@/components/ui/SectionEyebrow";

export interface AttentionPoint {
  number: string;
  title: string;
  description?: string;
}

export function PointsOfAttention({
  introTitle,
  introDescription,
  points,
}: {
  introTitle: string;
  introDescription: string;
  points: AttentionPoint[];
}) {
  return (
    <section className="border-t border-hairline bg-bg-alt">
      <div className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <Reveal>
          <SectionEyebrow>Pontos que Merecem Atenção</SectionEyebrow>
          <div className="max-w-2xl">
            <h3 className="text-xl">{introTitle}</h3>
            <p className="mt-4 text-sm leading-relaxed text-ink-dim">
              {introDescription}
            </p>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {points.map((point) => (
              <div
                key={point.number}
                className="border border-hairline p-6 transition-colors duration-150 hover:border-gold"
              >
                <span className="font-mono text-2xl text-gold tabular-nums">
                  {point.number}
                </span>
                <h4 className="mt-3 text-lg">{point.title}</h4>
                {point.description && (
                  <p className="mt-2 text-sm leading-relaxed text-ink-dim">
                    {point.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
