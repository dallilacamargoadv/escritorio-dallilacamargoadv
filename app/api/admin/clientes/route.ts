import { NextRequest, NextResponse } from "next/server";
import {
  createCliente,
  convertLeadToCliente,
  getAllClientes,
  type ClienteInput,
} from "@/lib/db-clientes";

export async function GET() {
  try {
    const clientes = await getAllClientes();
    return NextResponse.json({ clientes });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os clientes" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const nomeRazaoSocial =
    typeof body?.nome_razao_social === "string"
      ? body.nome_razao_social.trim()
      : "";
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const leadId = typeof body?.lead_id === "string" ? body.lead_id : undefined;

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
    const cliente = leadId
      ? await convertLeadToCliente(leadId, input)
      : await createCliente(input);
    return NextResponse.json({ cliente });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o cliente" },
      { status: 401 },
    );
  }
}
