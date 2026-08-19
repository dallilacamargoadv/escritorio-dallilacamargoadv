import { createClient } from "@/lib/supabase/server";

export interface EsteiraServicoValor {
  label: string;
  valor: string;
}

export interface EsteiraServico {
  id: string;
  ordem: number;
  nome: string;
  descricao: string | null;
  valores: EsteiraServicoValor[];
  observacao: string | null;
  ativo: boolean;
  created_at: string;
}

export async function getEsteiraServicos(): Promise<EsteiraServico[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("esteira_servicos")
    .select("*")
    .order("ordem", { ascending: true });

  if (error) throw error;
  return (data ?? []) as EsteiraServico[];
}
