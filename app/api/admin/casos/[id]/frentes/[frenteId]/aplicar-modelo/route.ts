import { NextRequest, NextResponse } from "next/server";
import { getCasoById } from "@/lib/db-casos";
import { getAllFrentes } from "@/lib/db-frentes";
import { getFluxoTemplateFor } from "@/lib/db-fluxo-templates";
import { copiarEtapasDoTemplate, getEtapasByFrente } from "@/lib/db-frente-etapas";

export async function POST(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/casos/[id]/frentes/[frenteId]/aplicar-modelo">,
) {
  const { id, frenteId } = await ctx.params;

  try {
    const caso = await getCasoById(id);
    if (!caso) {
      return NextResponse.json({ error: "Caso não encontrado" }, { status: 404 });
    }

    const frentes = await getAllFrentes(id);
    const frente = frentes.find((f) => f.id === frenteId);
    if (!frente) {
      return NextResponse.json({ error: "Frente não encontrada" }, { status: 404 });
    }

    const etapasExistentes = await getEtapasByFrente(frenteId);
    if (etapasExistentes.length > 0) {
      return NextResponse.json(
        { error: "Essa frente já tem etapas — aplicar o modelo de novo duplicaria." },
        { status: 400 },
      );
    }

    const template = await getFluxoTemplateFor(caso.area, frente.tipo);
    if (!template || template.etapas.length === 0) {
      return NextResponse.json(
        { error: "Não existe modelo cadastrado pra essa área e tipo de frente" },
        { status: 400 },
      );
    }

    await copiarEtapasDoTemplate(frenteId, caso.area, frente.tipo);
    const etapas = await getEtapasByFrente(frenteId);
    return NextResponse.json({ etapas });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível aplicar o modelo" },
      { status: 401 },
    );
  }
}
