import { notFound, redirect } from "next/navigation";
import { getCasoById } from "@/lib/db-casos";
import { getContratoById } from "@/lib/db-contratos";
import { getClienteById } from "@/lib/db-clientes";
import { getAllFrentes } from "@/lib/db-frentes";
import { getDocumentosByCaso } from "@/lib/db-documentos";
import { getHistoricoByCaso } from "@/lib/db-caso-historico";
import { getAtividadesByCaso } from "@/lib/db-atividades";
import { CasoForm, type ContratoOption } from "@/components/admin/CasoForm";
import { CasoFrentes } from "@/components/admin/CasoFrentes";
import { CasoTimeline } from "@/components/admin/CasoTimeline";
import { CollapsibleSection } from "@/components/admin/CollapsibleSection";
import { CONTRATO_TIPO_LABELS } from "@/lib/admin-labels";

export default async function CasoDetailPage(
  props: PageProps<"/admin/casos/[id]">,
) {
  const { id } = await props.params;

  let caso;
  let contratoFixo: ContratoOption | undefined;
  let frentes;
  let documentos;
  let historico;
  let atividades;
  try {
    caso = await getCasoById(id);
    if (caso) {
      const contrato = await getContratoById(caso.contrato_id);
      const cliente = contrato
        ? await getClienteById(contrato.cliente_id)
        : null;
      contratoFixo = contrato
        ? {
            id: contrato.id,
            label: `${cliente?.nome_razao_social ?? "Cliente"} — ${CONTRATO_TIPO_LABELS[contrato.tipo]}`,
          }
        : undefined;
      frentes = await getAllFrentes(caso.id);
      documentos = await getDocumentosByCaso(caso.id);
      historico = await getHistoricoByCaso(caso.id);
      atividades = await getAtividadesByCaso(
        caso.id,
        frentes.map((f) => f.id),
      );
    }
  } catch {
    redirect("/login");
  }

  if (!caso) notFound();

  return (
    <>
      <CasoForm caso={caso} contratoFixo={contratoFixo} />
      <CollapsibleSection title="Frentes / Dados processuais" defaultOpen>
        <CasoFrentes casoId={caso.id} initialFrentes={frentes ?? []} />
      </CollapsibleSection>
      <CasoTimeline
        casoId={caso.id}
        initialHistorico={historico ?? []}
        initialAtividades={atividades ?? []}
        initialDocumentos={documentos ?? []}
      />
    </>
  );
}
