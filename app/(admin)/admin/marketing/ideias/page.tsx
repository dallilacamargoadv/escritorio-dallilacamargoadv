import { redirect } from "next/navigation";
import { getIdeias } from "@/lib/db-ideias";
import { BancoIdeiasClient } from "@/components/admin/BancoIdeiasClient";

export default async function BancoIdeiasPage() {
  let ideias;
  try {
    ideias = await getIdeias();
  } catch {
    redirect("/login");
  }
  return <BancoIdeiasClient ideiasIniciais={ideias} />;
}
