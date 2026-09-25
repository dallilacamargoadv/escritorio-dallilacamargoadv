"use client";

import { useState } from "react";
import { getUtms } from "@/lib/utms";
import { getClientMetadata, type ClientMetadata } from "@/lib/metadata";
import { isValidEmail, isValidName, isValidWhatsapp } from "@/lib/validation";
import { trackLead } from "@/lib/tracking";
import {
  AdvanceButton,
  FormProgress,
  FormSuccess,
  OptionButton,
  StepFrame,
  TextQuestion,
} from "@/components/forms/FormPieces";

interface FormData {
  name: string;
  email: string;
  whatsapp: string;
  situation: string;
  notified: string;
  documents: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  whatsapp: "",
  situation: "",
  notified: "",
  documents: "",
};

const TOTAL_STEPS = 7;
const TOTAL_QUESTIONS = 6;

const SITUATION_OPTIONS = [
  {
    value: "continua",
    label: "Já tem canal ou perfil ativo, ganhando dinheiro",
    hint: "Esse é o alvará de atividade contínua.",
  },
  {
    value: "campanha",
    label: "É só uma campanha ou publi pontual",
    hint: "Esse é o alvará de campanha específica.",
  },
  {
    value: "ainda_nao_comecou",
    label: "Ainda não começou, quero me planejar antes",
  },
];

const NOTIFIED_OPTIONS = [
  {
    value: "sim_notificada",
    label: "Sim, a plataforma já notificou",
    hint: "O prazo já está correndo, isso muda a urgência.",
  },
  { value: "nao_ainda", label: "Não, ainda não fui notificada(o)" },
  { value: "nao_sei", label: "Não sei dizer" },
];

const DOCUMENTS_OPTIONS = [
  {
    value: "tenho_a_maioria",
    label: "Já tenho a maioria dos documentos prontos",
    hint: "Matrícula escolar, laudo psicológico, anuência dos responsáveis.",
  },
  { value: "tenho_pouco", label: "Tenho só uma parte" },
  { value: "nao_tenho_nada", label: "Ainda não tenho nenhum documento" },
];

export function AlvaraMirimForm() {
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
      const response = await fetch("/api/alvara-mirim-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finalFormData, utms, metadata: browserMetadata }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao enviar");

      if (data?._eventId) {
        trackLead({
          eventId: data._eventId,
          contentName: "Alvará Mirim",
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
    return <FormSuccess areaLabel="Alvará Mirim" />;
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
          <p className="text-lg text-ink">Como está a situação hoje?</p>
          <div className="mt-4 space-y-3">
            {SITUATION_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                hint={option.hint}
                selected={formData.situation === option.value}
                onClick={() => handleOptionSelect("situation", option.value)}
              />
            ))}
          </div>
        </StepFrame>
      )}

      {step === 5 && (
        <StepFrame step={step} error={error} onBack={handlePrev}>
          <p className="text-lg text-ink">
            Alguma plataforma já notificou pedindo o alvará?
          </p>
          <div className="mt-4 space-y-3">
            {NOTIFIED_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                hint={option.hint}
                selected={formData.notified === option.value}
                onClick={() => handleOptionSelect("notified", option.value)}
              />
            ))}
          </div>
        </StepFrame>
      )}

      {step === 6 && (
        <StepFrame step={step} error={error} onBack={handlePrev}>
          <p className="text-lg text-ink">
            Você já tem algum documento organizado?
          </p>
          <div className="mt-4 space-y-3">
            {DOCUMENTS_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                hint={option.hint}
                selected={formData.documents === option.value}
                onClick={() => {
                  const next = { ...formData, documents: option.value };
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
