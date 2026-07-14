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
  profile: string;
  interest: string;
}

const initialFormData: FormData = {
  name: "",
  email: "",
  whatsapp: "",
  profile: "",
  interest: "",
};

const TOTAL_STEPS = 6;
const TOTAL_QUESTIONS = 5;

const PROFILE_OPTIONS = [
  { value: "criador", label: "Criador de Conteúdo / Influenciador digital" },
  {
    value: "infoprodutor",
    label: "Infoprodutor / Coprodutor",
    hint: "Venda de cursos, e-books, mentorias.",
  },
  { value: "empresa", label: "Empresa / E-commerce / Negócio Físico" },
  { value: "autonomo", label: "Profissional Autônomo / Prestador de Serviços" },
  { value: "outro", label: "Outro" },
];

const INTEREST_OPTIONS = [
  {
    value: "protecao_dados",
    label: "Proteção de dados / Adequação à LGPD",
  },
  {
    value: "relacoes_digitais",
    label: "Relações digitais e desafios do dia a dia",
  },
  { value: "outro", label: "Outro assunto" },
];

export function AssessoriaEstrategicaForm() {
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
      const response = await fetch("/api/assessoria-estrategica-leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...finalFormData, utms, metadata: browserMetadata }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Erro ao enviar");

      if (data?._eventId) {
        trackLead({
          eventId: data._eventId,
          contentName: "Assessoria Estratégica",
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
          <p className="text-lg text-ink">
            Qual é o seu perfil profissional ou do seu negócio?
          </p>
          <div className="mt-4 space-y-3">
            {PROFILE_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                hint={option.hint}
                selected={formData.profile === option.value}
                onClick={() => handleOptionSelect("profile", option.value)}
              />
            ))}
          </div>
        </StepFrame>
      )}

      {step === 5 && (
        <StepFrame step={step} error={error} onBack={handlePrev}>
          <p className="text-lg text-ink">
            Qual assunto mais se aproxima da sua necessidade?
          </p>
          <div className="mt-4 space-y-3">
            {INTEREST_OPTIONS.map((option) => (
              <OptionButton
                key={option.value}
                label={option.label}
                selected={formData.interest === option.value}
                onClick={() => {
                  const next = { ...formData, interest: option.value };
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
