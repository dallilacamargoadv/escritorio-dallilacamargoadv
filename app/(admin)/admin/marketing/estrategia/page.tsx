import { redirect } from "next/navigation";
import { getEstrategiaAreas } from "@/lib/db-estrategia";
import { EstrategiaClient } from "@/components/admin/EstrategiaClient";

export default async function EstrategiaPage() {
  let areas;
  try {
    areas = await getEstrategiaAreas();
  } catch {
    redirect("/login");
  }

  return <EstrategiaClient areasIniciais={areas} />;
}
