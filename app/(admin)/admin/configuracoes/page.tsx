import { redirect } from "next/navigation";
import { getAllDespesaCategorias } from "@/lib/db-despesa-categorias";
import { ConfiguracoesHub } from "@/components/admin/ConfiguracoesHub";

export default async function ConfiguracoesPage() {
  let categorias;
  try {
    categorias = await getAllDespesaCategorias();
  } catch {
    redirect("/login");
  }

  return <ConfiguracoesHub initialCategorias={categorias} />;
}
