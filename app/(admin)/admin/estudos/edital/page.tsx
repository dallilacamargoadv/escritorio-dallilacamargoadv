import { redirect } from "next/navigation";
import { getEstudoConfig, getTopicoEstados } from "@/lib/db-estudos";
import { EditalClient } from "@/components/admin/estudos/EditalClient";
import { Cabecalho } from "@/components/estudos/ui";

export default async function EditalPage() {
  let dados;
  try {
    dados = await Promise.all([getTopicoEstados(), getEstudoConfig()]);
  } catch {
    redirect("/login");
  }
  const [estados, config] = dados;
  return (
    <>
      <Cabecalho titulo="Edital" sub="184 tópicos do edital verticalizado previsto, em ordem de estudo." />
      <EditalClient estadosIniciais={[...estados.values()]} config={config} />
    </>
  );
}
