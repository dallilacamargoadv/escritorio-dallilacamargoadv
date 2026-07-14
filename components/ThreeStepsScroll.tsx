"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface ScrollStep {
  number: string;
  title: string;
  description: string;
}

const DEFAULT_STEPS: ScrollStep[] = [
  {
    number: "01",
    title: "Fale conosco",
    description:
      "Entre em contato pelo formulário, e a equipe agenda uma conversa inicial.",
  },
  {
    number: "02",
    title: "Diagnóstico",
    description:
      "Em conversa estruturada, mapeamos a operação e os pontos contratuais críticos do seu caso.",
  },
  {
    number: "03",
    title: "Atuação",
    description:
      "Com escopo definido, iniciamos a atuação em formato pontual ou em assessoria recorrente.",
  },
];

const RADIUS = 92;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const ARC_LEN = CIRCUMFERENCE / 3 - 8;

function segmentProgress(progress: number, index: number) {
  return Math.min(1, Math.max(0, progress * 3 - index));
}

function subscribeReducedMotion(callback: () => void) {
  const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}

function getReducedMotionSnapshot() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

export function ThreeStepsScroll({
  title = "3 Passos Iniciais",
  steps = DEFAULT_STEPS,
  closingText,
}: {
  title?: string;
  steps?: ScrollStep[];
  closingText?: string;
}) {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot,
  );
  const progress = reducedMotion ? 1 : scrollProgress;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || reducedMotion) return;

    const trigger = ScrollTrigger.create({
      trigger: section,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,
      onUpdate: (self) => setScrollProgress(self.progress),
    });

    return () => trigger.kill();
  }, [reducedMotion]);

  const activeIndex = Math.min(steps.length - 1, Math.floor(progress * 3));
  const scale = 0.85 + progress * 0.3;

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: "360vh" }}
    >
      <div className="min-h-screen-safe sticky top-0 flex flex-col items-center justify-center overflow-hidden bg-bg-alt px-4 py-16">
        <div className="mb-10 flex items-center gap-4 md:mb-14">
          <span className="h-px w-10 bg-hairline" />
          <Image
            src="/logo-abelha.png"
            width={32}
            height={32}
            alt=""
            aria-hidden="true"
            className="h-8 w-8 opacity-80"
          />
          <span className="font-eyebrow text-base text-gold">{title}</span>
          <span className="h-px w-10 bg-hairline" />
        </div>

        <div className="flex flex-col items-center gap-10 md:flex-row md:gap-20">
          <div
            className="relative shrink-0"
            style={{
              width: 220,
              height: 220,
              transform: `scale(${scale})`,
            }}
          >
            <svg viewBox="0 0 220 220" className="h-full w-full -rotate-90">
              {[0, 1, 2].map((i) => (
                <circle
                  key={`track-${i}`}
                  cx="110"
                  cy="110"
                  r={RADIUS}
                  fill="none"
                  stroke="var(--hairline)"
                  strokeWidth={2}
                  strokeDasharray={`${ARC_LEN} ${CIRCUMFERENCE}`}
                  transform={`rotate(${i * 120} 110 110)`}
                />
              ))}
              {[0, 1, 2].map((i) => {
                const segProg = segmentProgress(progress, i);
                return (
                  <circle
                    key={`fill-${i}`}
                    cx="110"
                    cy="110"
                    r={RADIUS}
                    fill="none"
                    stroke="var(--gold)"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeDasharray={`${ARC_LEN} ${CIRCUMFERENCE}`}
                    strokeDashoffset={ARC_LEN * (1 - segProg)}
                    transform={`rotate(${i * 120} 110 110)`}
                  />
                );
              })}
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                key={activeIndex}
                className="animate-fade-in font-mono text-4xl tabular-nums text-ink"
              >
                {steps[activeIndex].number}
              </span>
            </div>
          </div>

          <div className="hidden md:flex md:max-w-md md:flex-col md:gap-8">
            {steps.map((step, i) => {
              const visible = segmentProgress(progress, i) > 0.05;
              return (
                <div
                  key={step.number}
                  className={`transition-all duration-500 ease-out ${
                    visible
                      ? "translate-y-0 opacity-100"
                      : "translate-y-3 opacity-0"
                  }`}
                >
                  <span className="font-mono text-xs text-gold">
                    Passo {step.number}
                  </span>
                  <h3 className="mt-1 text-xl">{step.title}</h3>
                  <p className="mt-1 max-w-sm text-sm leading-relaxed text-ink-dim">
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="max-w-xs text-center md:hidden">
            <span key={activeIndex} className="animate-fade-in block">
              <span className="font-mono text-xs text-gold">
                Passo {steps[activeIndex].number}
              </span>
              <h3 className="mt-1 text-xl">{steps[activeIndex].title}</h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-dim">
                {steps[activeIndex].description}
              </p>
            </span>
          </div>
        </div>

        {closingText && (
          <p
            className={`mt-12 max-w-md text-center text-sm text-ink-dim transition-opacity duration-500 ${
              progress > 0.92 ? "opacity-100" : "opacity-0"
            }`}
          >
            {closingText}
          </p>
        )}
      </div>
    </section>
  );
}
