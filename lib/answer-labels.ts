export const ANSWER_QUESTION_LABELS: Record<string, string> = {
  serviceType: "Tipo de serviço",
  activity: "Atividade",
  urgency: "Urgência",
  profile: "Perfil",
  need: "Necessidade",
  incident: "Tipo de incidente",
  platform: "Plataforma",
  professionalUse: "Uso profissional",
  interest: "Área de interesse",
};

export function prettifyAnswerValue(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
