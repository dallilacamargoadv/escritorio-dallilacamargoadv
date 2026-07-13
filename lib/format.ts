// Formata datas em UTC para evitar que "2026-07-01" apareça como 30/06
// para visitantes em fusos horários negativos (ex.: Brasil, UTC-3).
export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(dateString));
}
