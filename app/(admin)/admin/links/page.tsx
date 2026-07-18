import { redirect } from "next/navigation";
import { getAllLinkGrupos } from "@/lib/db-links";
import { LinksHub } from "@/components/admin/LinksHub";

export default async function LinksPage() {
  let grupos;
  try {
    grupos = await getAllLinkGrupos();
  } catch {
    redirect("/login");
  }

  return <LinksHub initialGrupos={grupos} />;
}
