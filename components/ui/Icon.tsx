import {
  FileSignature,
  ShieldCheck,
  ScrollText,
  Clock,
  UserCircle2,
  CircleDollarSign,
  Workflow,
  Globe,
  BadgeCheck,
  KeyRound,
  Ban,
  AlertTriangle,
  Smartphone,
  Briefcase,
  Handshake,
  Copyright,
  Gavel,
  Lock,
  Compass,
  type LucideIcon,
} from "lucide-react";

const ICONS = {
  contrato: FileSignature,
  protecao: ShieldCheck,
  licenciamento: ScrollText,
  prazo: Clock,
  conta: UserCircle2,
  moeda: CircleDollarSign,
  processo: Workflow,
  digital: Globe,
  marca: BadgeCheck,
  acesso: KeyRound,
  bloqueio: Ban,
  alerta: AlertTriangle,
  plataforma: Smartphone,
  atividade: Briefcase,
  parceria: Handshake,
  autoral: Copyright,
  defesa: Gavel,
  dados: Lock,
  estrategia: Compass,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof ICONS;

export function Icon({
  name,
  className = "",
}: {
  name: IconName;
  className?: string;
}) {
  const Cmp = ICONS[name];
  return (
    <Cmp
      className={`text-gold ${className}`}
      strokeWidth={1.4}
      size={24}
      aria-hidden="true"
    />
  );
}
