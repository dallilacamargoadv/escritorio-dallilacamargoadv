import { notFound, redirect } from "next/navigation";
import { getParceiroById } from "@/lib/db-parceiros";
import { ParceiroForm } from "@/components/admin/ParceiroForm";

export default async function EditParceiroPage(
  props: PageProps<"/admin/parcerias/[id]/editar">,
) {
  const { id } = await props.params;

  let parceiro;
  try {
    parceiro = await getParceiroById(id);
  } catch {
    redirect("/login");
  }

  if (!parceiro) notFound();

  return <ParceiroForm parceiro={parceiro} />;
}
