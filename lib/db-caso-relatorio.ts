import { getCasoById, type Caso } from "@/lib/db-casos";
import { getContratoById, type Contrato } from "@/lib/db-contratos";
import { getClienteById, type Cliente } from "@/lib/db-clientes";
import { getAllFrentes, type Frente } from "@/lib/db-frentes";
import { getAtividadesByCaso, type Atividade } from "@/lib/db-atividades";
import { getAllLancamentos, type Lancamento } from "@/lib/db-financeiro";
import { getDocumentosByCaso, type Documento } from "@/lib/db-documentos";
import { getHistoricoByCaso, type CasoHistoricoEntry } from "@/lib/db-caso-historico";

export interface CasoRelatorioData {
  caso: Caso;
  contrato: Contrato | null;
  cliente: Cliente | null;
  frentes: Frente[];
  prazos: Atividade[];
  lancamentos: Lancamento[];
  documentos: Documento[];
  historico: CasoHistoricoEntry[];
}

export async function getCasoRelatorioData(
  casoId: string,
): Promise<CasoRelatorioData | null> {
  const caso = await getCasoById(casoId);
  if (!caso) return null;

  const [contrato, frentes] = await Promise.all([
    getContratoById(caso.contrato_id),
    getAllFrentes(caso.id),
  ]);

  const [cliente, prazos, lancamentos, documentos, historico] = await Promise.all([
    contrato ? getClienteById(contrato.cliente_id) : Promise.resolve(null),
    getAtividadesByCaso(
      caso.id,
      frentes.map((f) => f.id),
    ),
    getAllLancamentos(undefined, caso.contrato_id),
    getDocumentosByCaso(caso.id),
    getHistoricoByCaso(caso.id),
  ]);

  return { caso, contrato, cliente, frentes, prazos, lancamentos, documentos, historico };
}
