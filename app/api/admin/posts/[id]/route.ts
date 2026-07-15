import { NextRequest, NextResponse } from "next/server";
import {
  deletePost,
  getPostByIdAdmin,
  updatePost,
  type PostInput,
} from "@/lib/db-blog-admin";
import { slugify, BLOG_CATEGORIES } from "@/lib/blog";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/posts/[id]">,
) {
  const { id } = await ctx.params;

  try {
    const post = await getPostByIdAdmin(id);
    if (!post) {
      return NextResponse.json({ error: "Post não encontrado" }, { status: 404 });
    }
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar o post" },
      { status: 401 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/admin/posts/[id]">,
) {
  const { id } = await ctx.params;
  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const subtitle = typeof body?.subtitle === "string" ? body.subtitle.trim() : "";
  const category = body?.category;
  const content = typeof body?.content === "string" ? body.content : "";
  const published = Boolean(body?.published);
  const slug = typeof body?.slug === "string" && body.slug.trim()
    ? slugify(body.slug)
    : slugify(title);

  if (!title || !BLOG_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Título e categoria são obrigatórios" },
      { status: 400 },
    );
  }

  const input: PostInput = { slug, title, subtitle, category, content, published };

  try {
    const post = await updatePost(id, input);
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível atualizar o post" },
      { status: 401 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/admin/posts/[id]">,
) {
  const { id } = await ctx.params;

  try {
    await deletePost(id);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível excluir o post" },
      { status: 401 },
    );
  }
}
