import { NextResponse } from "next/server";
import { getAllPageSeoAdmin } from "@/lib/db-page-seo";

export async function GET() {
  try {
    const pages = await getAllPageSeoAdmin();
    return NextResponse.json({ pages });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível carregar o SEO das páginas" },
      { status: 401 },
    );
  }
}
