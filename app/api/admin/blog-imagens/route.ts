import { NextRequest, NextResponse } from "next/server";
import { uploadBlogImagem } from "@/lib/db-blog-imagens";

const MAX_SIZE_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo é obrigatório" }, { status: 400 });
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: "Imagem maior que 8MB" }, { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return NextResponse.json({ error: "Arquivo precisa ser uma imagem" }, { status: 400 });
  }

  try {
    const url = await uploadBlogImagem(file);
    return NextResponse.json({ url });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível enviar a imagem" },
      { status: 401 },
    );
  }
}
