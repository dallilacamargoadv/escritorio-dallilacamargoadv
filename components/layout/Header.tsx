"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SERVICE_AREAS } from "@/lib/site-data";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";

export function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-hairline bg-bg/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" onClick={() => setMobileOpen(false)}>
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Principal">
          <Link
            href="/"
            className="text-sm text-ink hover:text-gold transition-colors duration-150"
          >
            Início
          </Link>
          <div className="group relative">
            <button className="text-sm text-ink hover:text-gold transition-colors duration-150">
              Áreas de Atuação
            </button>
            <div className="invisible absolute left-1/2 top-full w-72 -translate-x-1/2 pt-3 opacity-0 transition-all duration-150 ease-out group-hover:visible group-hover:opacity-100">
              <ul className="border border-hairline bg-surface p-2 shadow-lg">
                {SERVICE_AREAS.map((area) => (
                  <li key={area.slug}>
                    <Link
                      href={`/${area.slug}`}
                      className="block px-4 py-3 text-sm text-ink hover:text-gold hover:bg-bg-alt transition-colors duration-150"
                    >
                      {area.menuLabel}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link
            href="/sobre"
            className="text-sm text-ink hover:text-gold transition-colors duration-150"
          >
            Sobre
          </Link>
          <Link
            href="/blog"
            className="text-sm text-ink hover:text-gold transition-colors duration-150"
          >
            Blog
          </Link>
          <Button href="/contato" className="!px-5 !py-2.5">
            Contato
          </Button>
        </nav>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center md:hidden"
          aria-label={mobileOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={mobileOpen}
          onClick={() => setMobileOpen((v) => !v)}
        >
          <span className="relative block h-4 w-6">
            <span
              className={`absolute left-0 top-0 h-px w-6 bg-ink transition-transform duration-200 ${mobileOpen ? "translate-y-[7px] rotate-45" : ""}`}
            />
            <span
              className={`absolute left-0 top-[7px] h-px w-6 bg-ink transition-opacity duration-200 ${mobileOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`absolute left-0 top-[14px] h-px w-6 bg-ink transition-transform duration-200 ${mobileOpen ? "-translate-y-[7px] -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      {mobileOpen && (
        <div className="fixed inset-x-0 top-16 bottom-0 z-40 min-h-screen-safe overflow-y-auto bg-bg md:hidden">
          <nav
            aria-label="Principal (mobile)"
            className="flex flex-col gap-1 px-4 py-6"
          >
            <Link
              href="/"
              onClick={() => setMobileOpen(false)}
              className="border-b border-hairline px-2 py-4 text-base text-ink"
            >
              Início
            </Link>
            <span className="font-eyebrow text-gold text-[10px] px-2 pb-2 pt-4">
              Áreas de Atuação
            </span>
            {SERVICE_AREAS.map((area) => (
              <Link
                key={area.slug}
                href={`/${area.slug}`}
                onClick={() => setMobileOpen(false)}
                className="border-b border-hairline px-2 py-4 text-base text-ink"
              >
                {area.menuLabel}
              </Link>
            ))}
            <Link
              href="/sobre"
              onClick={() => setMobileOpen(false)}
              className="border-b border-hairline px-2 py-4 text-base text-ink"
            >
              Sobre
            </Link>
            <Link
              href="/blog"
              onClick={() => setMobileOpen(false)}
              className="border-b border-hairline px-2 py-4 text-base text-ink"
            >
              Blog
            </Link>
            <div className="pt-6">
              <Button href="/contato" className="w-full">
                Contato
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
