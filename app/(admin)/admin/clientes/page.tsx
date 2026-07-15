import { redirect } from "next/navigation";
import { getAllClientes } from "@/lib/db-clientes";
import { ClientesAdminList } from "@/components/admin/ClientesAdminList";

export default async function AdminClientesPage() {
  let clientes;
  try {
    clientes = await getAllClientes();
  } catch {
    redirect("/login");
  }

  return <ClientesAdminList initialClientes={clientes} />;
}
