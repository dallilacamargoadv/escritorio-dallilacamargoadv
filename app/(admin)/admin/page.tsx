import { redirect } from "next/navigation";

/** O painel abre sempre nos estudos (inclusive atalhos e app instalado antigos). O escritório fica em /admin/escritorio. */
export default function AdminInicio() {
  redirect("/admin/estudos");
}
