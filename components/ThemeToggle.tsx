"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Sun, Moon } from "lucide-react";

type Theme = "dark" | "light";

const STORAGE_KEY = "theme";
const CARD_DURATION_MS = 4000;

function applyTheme(theme: Theme) {
  document.documentElement.setAttribute("data-theme", theme);
}

function readStoredTheme(): Theme | null {
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return stored === "dark" || stored === "light" ? stored : null;
}

function subscribe(callback: () => void) {
  window.addEventListener("theme-change", callback);
  return () => window.removeEventListener("theme-change", callback);
}

function getThemeSnapshot(): Theme {
  return (
    readStoredTheme() ??
    (window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark")
  );
}

function getThemeServerSnapshot(): Theme {
  return "dark";
}

function getFirstVisitSnapshot(): boolean {
  return readStoredTheme() === null;
}

function getFirstVisitServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle({
  variant = "floating",
}: {
  variant?: "floating" | "inline";
}) {
  const theme = useSyncExternalStore(
    subscribe,
    getThemeSnapshot,
    getThemeServerSnapshot,
  );
  const isFirstVisit = useSyncExternalStore(
    subscribe,
    getFirstVisitSnapshot,
    getFirstVisitServerSnapshot,
  );
  const [dismissed, setDismissed] = useState(false);
  const showCard = variant === "floating" && isFirstVisit && !dismissed;

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    if (!showCard) return;
    const timer = window.setTimeout(() => setDismissed(true), CARD_DURATION_MS);
    return () => window.clearTimeout(timer);
  }, [showCard]);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    window.localStorage.setItem(STORAGE_KEY, next);
    setDismissed(true);
    window.dispatchEvent(new Event("theme-change"));
  }

  const label =
    theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro";

  if (variant === "inline") {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="flex h-9 w-9 items-center justify-center text-ink-dim transition-colors duration-150 hover:text-gold"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-[60] flex items-center">
      {showCard && (
        <button
          type="button"
          onClick={toggle}
          className="animate-fade-up mr-3 flex items-center gap-2 border border-hairline-strong bg-surface px-4 py-3 text-xs text-ink-dim shadow-lg transition-colors duration-150 hover:border-gold hover:text-gold"
        >
          Prefere o modo {theme === "dark" ? "claro" : "escuro"}?
        </button>
      )}
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="flex h-11 w-11 items-center justify-center border border-hairline-strong bg-surface text-ink transition-colors duration-150 hover:border-gold hover:text-gold"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </div>
  );
}
