import { NextRequest, NextResponse } from "next/server";
import {
  getClienteById,
  updateCliente,
  type ClienteInput,
} from "@/lib/db-clientes";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/clientes/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const cliente = await getClienteById(id);
    if (!cliente) {
      return NextResponse.json(
        { error: "Cliente não encontrado" },
        { status: 404 },
      );
    }
    return NextResponse.json({ cliente });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o cliente" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/clientes/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const nomeRazaoSocial =
    typeof body?.nome_razao_social === "string"
      ? body.nome_razao_social.trim()
      : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";

  if (!nomeRazaoSocial || !email) {
    return NextResponse.json(
      { error: "Nome/razão social e e-mail são obrigatórios" },
      { status: 400 },
    );
  }

  const input: ClienteInput = {
    tipo_pessoa: body?.tipo_pessoa === "pj" ? "pj" : "pf",
    nome_razao_social: nomeRazaoSocial,
    documento: typeof body?.documento === "string" ? body.documento.trim() : "",
    email,
    whatsapp: typeof body?.whatsapp === "string" ? body.whatsapp.trim() : "",
    endereco: {
      completo:
        typeof body?.endereco?.completo === "string"
          ? body.endereco.completo.trim()
          : "",
    },
    area_origem: body?.area_origem ?? null,
  };

  try {
    const cliente = await updateCliente(id, input);
    return NextResponse.json({ cliente });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o cliente" },
      { status: 401 },
    );
  }
}
