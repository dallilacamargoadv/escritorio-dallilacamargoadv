"use client";

import type { InputHTMLAttributes } from "react";
import { ChevronLeft } from "lucide-react";
import { scrollInputIntoView } from "@/lib/mobile-utils";

export function FormProgress({
  step,
  totalQuestions,
}: {
  step: number;
  totalQuestions: number;
}) {
  if (step <= 0 || step > totalQuestions) return null;

  return (
    <div className="mb-8">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-hairline">
        <div
          className="h-full bg-gold transition-all duration-500 ease-out"
          style={{ width: `${(step / totalQuestions) * 100}%` }}
        />
      </div>
      <p className="mt-3 text-center font-eyebrow text-[10px] text-gold">
        Etapa {step}/{totalQuestions}
      </p>
    </div>
  );
}

export function StepFrame({
  step,
  error,
  onBack,
  children,
}: {
  step: number;
  error: string;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  return (
    <div key={step} className="animate-step-in">
      {children}
      {error && (
        <p role="alert" id="form-error" className="mt-4 text-sm text-error">
          {error}
        </p>
      )}
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="mt-6 flex items-center gap-1 text-xs text-ink-dim transition-colors duration-150 hover:text-gold"
        >
          <ChevronLeft size={14} /> Voltar
        </button>
      )}
    </div>
  );
}

interface TextQuestionProps
  extends Pick<
    InputHTMLAttributes<HTMLInputElement>,
    "type" | "inputMode" | "autoComplete" | "autoCapitalize"
  > {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onEnter: () => void;
  placeholder?: string;
}

export function TextQuestion({
  label,
  value,
  onChange,
  onEnter,
  placeholder,
  type = "text",
  inputMode,
  autoComplete,
  autoCapitalize = "on",
}: TextQuestionProps) {
  return (
    <div>
      <label className="block text-lg text-ink">{label}</label>
      <input
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        autoCapitalize={autoCapitalize}
        autoCorrect="off"
        spellCheck={false}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={(e) => scrollInputIntoView(e.currentTarget)}
        onKeyDown={(e) => e.key === "Enter" && onEnter()}
        placeholder={placeholder}
        aria-label={label}
        aria-required="true"
        className="mt-4 w-full border border-hairline-strong bg-transparent p-4 text-base text-ink outline-none transition-colors duration-150 focus:border-gold"
      />
    </div>
  );
}

export function OptionButton({
  label,
  hint,
  selected,
  onClick,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full border p-4 text-left transition-all duration-150 ${
        selected
          ? "border-gold bg-gold/10 text-gold"
          : "border-hairline text-ink hover:border-gold/50"
      }`}
    >
      <span className="block text-sm font-medium">{label}</span>
      {hint && <span className="mt-1 block text-xs text-ink-dim">{hint}</span>}
    </button>
  );
}

export function AdvanceButton({
  onClick,
  children = "Avançar",
}: {
  onClick: () => void;
  children?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 w-full bg-gold px-6 py-3 text-sm font-medium text-bg transition-all duration-150 ease-out active:scale-[0.97] sm:w-auto"
    >
      {children}
    </button>
  );
}
