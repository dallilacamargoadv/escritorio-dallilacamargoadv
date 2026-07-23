import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { updatePageSeo } from "@/lib/db-page-seo";
import { PAGE_SEO_ENTRIES } from "@/lib/site-data";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/page-seo/[slug]">,
) {
  const { slug } = await ctx.params;
  const body = await request.json();
  const metaTitle = typeof body?.meta_title === "string" ? body.meta_title.trim() : "";
  const metaDescription =
    typeof body?.meta_description === "string" ? body.meta_description.trim() : "";

  if (!metaTitle || !metaDescription) {
    return NextResponse.json(
      { error: "Meta título e meta descrição são obrigatórios" },
      { status: 400 },
    );
  }

  try {
    const page = await updatePageSeo(slug, {
      meta_title: metaTitle,
      meta_description: metaDescription,
    });
    const entry = PAGE_SEO_ENTRIES.find((e) => e.slug === slug);
    if (entry) revalidatePath(entry.path);
    return NextResponse.json({ page });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível atualizar o SEO da página" },
      { status: 401 },
    );
  }
}
