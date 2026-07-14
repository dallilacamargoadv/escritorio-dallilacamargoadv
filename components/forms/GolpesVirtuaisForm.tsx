"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { getUtms } from "@/lib/utms";
import { getClientMetadata, type ClientMetadata } from "@/lib/metadata";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { trackLead } from "@/lib/tracking";
import {
  AdvanceButton,
  FormProgress,
  OptionButton,
  StepFrame,
  TextQuestion,
} from "@/components/forms/FormPieces";

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  incident: string;
  platform: string;
  professionalUse: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  whatsapp: "",
  incident: "",
  platform: "",
  professionalUse: "",
};

const TOTAL_STEPS = 7;
const TOTAL_QUESTIONS = 6;

const INCIDENT_OPTIONS = [
  {
    value: "identidade",
    label: "Estão usando minha identidade ou minha imagem",
    hint: "Perfil falso criado por terceiros ou uso indevido das minhas informações.",
  },
  {
    value: "fraude_negociacao",
    label: "Fui vítima de fraude em uma negociação",
    hint: "Golpe envolvendo pagamento, venda ou prestação de serviço.",
  },
  {
    value: "conta_usada_por_terceiros",
    label: "Minha conta foi usada por terceiros para aplicar golpes",
    hint: "Após um acesso indevido, a conta foi usada para lesar outras pessoas.",
  },
  { value: "outra", label: "Outra situação" },
];

const PLATFORM_OPTIONS = [
  { value: "instagram", label: "Instagram" },
  { value: "facebook", label: "Facebook" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "email", label: "E-mail (Gmail, Outlook, etc.)" },
  { value: "outra", label: "Outra" },
];

const PROFESSIONAL_USE_OPTIONS = [
  { value: "sim", label: "Sim" },
  { value: "nao", label: "Não" },
];

export function GolpesVirtuaisForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [utms] = useState<Record<string, string>>(() => getUtms());
  const [browserMetadata] = useState<ClientMetadata>(() => getClientMetadata());
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateStep = (s: number): boolean => {
    if (s === 1 && !isValidName(formData.name)) {
      setError("Por favor, digite seu nome completo (nome + sobrenome).");
      return false;
    }
    if (s === 2 && !isValidEmail(formData.email)) {
      setError("Por favor, digite um e-mail válido.");
      return false;
    }
    if (s === 3 && !isValidWhatsapp(formData.whatsapp)) {
      setError("Por favor, digite um WhatsApp válido (com DDD).");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setError("");
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleOptionSelect = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    window.setTimeout(() => setStep((prev) => prev + 1), 300);
  };

  const handleSubmit = async (finalFormData: FormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/golpes-virtuais-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...finalFormData,
          professionalUse: finalFormData.professionalUse === "sim",
          utms,
          metadata: browserMetadata,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao enviar");

      if (data?._eventId) {
        trackLead({
          eventId: data._eventId,
          contentName: "Golpes Virtuais",
          value: data._value ?? 0,
        });
      }

      setStep(TOTAL_STEPS);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (step === TOTAL_STEPS) {
    return (
      <div className="flex flex-col items-center py-12 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-hairline-strong">
          <CheckCircle2 className="h-9 w-9 text-gold" />
        </div>
        <p className="max-w-md text-xl text-ink">
          Recebemos suas informações. Em breve entraremos em contato para dar
          sequência ao seu atendimento.
        </p>
      </div>
    );
  }

  return (
    <div>
      <FormProgress step={step} totalQuestions={TOTAL_QUESTIONS} />

      {step === 1 && (
        <StepFrame step={step} error={error}>
          <TextQuestion
            label="Qual o seu nome?"
            value={formData.name}
            onChange={(v) => setFormData((prev) => ({ ...prev, name: v }))}
            onEnter={handleNext}
            autoComplete="name"
          />
          <AdvanceButton onClick={handleNext} />
        </StepFrame>
      )}

      {step === 2 && (
        <StepFrame step={step} error={error} onBack={handlePrev}>
          <TextQuestion
            label="Qual o seu melhor e-mail?"
            value={formData.email}
            onChange={(v) => setFormData((prev) => ({ ...prev, email: v }))}
            onEnter={handleNext}
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="off"
          />
          <AdvanceButton onClick={handleNext} />
        </StepFrame>
      )}

      {step === 3 && (
        <StepFrame step={step} error={error} onBack={handlePrev}>
          <TextQuestion
            label="Qual o seu WhatsApp?"
            value={formData.whatsapp}
            onChange={(v) => setFormData((prev) => ({ ...prev, whatsapp: v }))}
            onEnter={handleNext}
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder="(00) 00000-0000"
          />
          <AdvanceButton onClick={handleNext} />
        </StepFrame>
      )}

      {step === 4 && (
        <StepFrame step={step} error={error} onBack={handlePrev}>
          <p className="text-lg text-ink">O que aconteceu?</p>
          <div className="mt-4 space-y-3">
            {INCIDENT_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                hint={option.hint}
                selected={formData.incident === option.value}
                onClick={() => handleOptionSelect("incident", option.value)}
              />
            ))}
          </div>
        </StepFrame>
      )}

      {step === 5 && (
        <StepFrame step={step} error={error} onBack={handlePrev}>
          <p className="text-lg text-ink">
            Em qual plataforma/rede social ocorreu o problema?
          </p>
          <div className="mt-4 space-y-3">
            {PLATFORM_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                selected={formData.platform === option.value}
                onClick={() => handleOptionSelect("platform", option.value)}
              />
            ))}
          </div>
        </StepFrame>
      )}

      {step === 6 && (
        <StepFrame step={step} error={error} onBack={handlePrev}>
          <p className="text-lg text-ink">
            Você utiliza essa conta para fins profissionais/trabalho?
          </p>
          <div className="mt-4 space-y-3">
            {PROFESSIONAL_USE_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                selected={formData.professionalUse === option.value}
                onClick={() => {
                  const next = { ...formData, professionalUse: option.value };
                  setFormData(next);
                  setError("");
                  handleSubmit(next);
                }}
              />
            ))}
          </div>
          {isSubmitting && (
            <p className="mt-4 text-sm text-ink-dim">Enviando...</p>
          )}
        </StepFrame>
      )}
    </div>
  );
}
