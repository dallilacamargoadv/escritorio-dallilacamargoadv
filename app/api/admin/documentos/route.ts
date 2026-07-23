import { NextRequest, NextResponse } from "next/server";
import { uploadDocumento } from "@/lib/db-documentos";

const MAX_SIZE_BYTES = 20 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const casoId = formData.get("caso_id");
  const file = formData.get("file");
  const descricao = formData.get("descricao");
  const marcoCliente = formData.get("marco_cliente");

  if (typeof casoId !== "string" || !casoId || !(file instanceof File)) {
    return NextResponse.json(
      { error: "Caso e arquivo são obrigatórios" },
      { status: 400 },
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json(
      { error: "Arquivo maior que 20MB" },
      { status: 400 },
    );
  }

  try {
    const documento = await uploadDocumento({
      casoId,
      file,
      descricao: typeof descricao === "string" && descricao.trim() ? descricao.trim() : null,
      marcoCliente:
        typeof marcoCliente === "string" && marcoCliente.trim()
          ? marcoCliente.trim()
          : null,
    });
    return NextResponse.json({ documento });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível enviar o documento" },
      { status: 401 },
    );
  }
}
