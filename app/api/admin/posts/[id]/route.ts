import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import {
  deletePost,
  getPostByIdAdmin,
  updatePost,
  type PostInput,
} from "@/lib/db-blog-admin";
import { slugify, BLOG_CATEGORIES, CATEGORY_SLUGS } from "@/lib/blog";

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
  } catch (error) {
    console.error(error);
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
  const metaTitle = typeof body?.meta_title === "string" && body.meta_title.trim()
    ? body.meta_title.trim()
    : null;
  const metaDescription =
    typeof body?.meta_description === "string" && body.meta_description.trim()
      ? body.meta_description.trim()
      : null;

  if (!title || !BLOG_CATEGORIES.includes(category)) {
    return NextResponse.json(
      { error: "Título e categoria são obrigatórios" },
      { status: 400 },
    );
  }

  const input: PostInput = {
    slug,
    title,
    subtitle,
    category,
    content,
    published,
    meta_title: metaTitle,
    meta_description: metaDescription,
  };

  try {
    const previous = await getPostByIdAdmin(id);
    const post = await updatePost(id, input);

    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath(`/blog/categoria/${CATEGORY_SLUGS[post.category]}`);
    if (previous && previous.slug !== post.slug) {
      revalidatePath(`/blog/${previous.slug}`);
    }
    if (previous && previous.category !== post.category) {
      revalidatePath(`/blog/categoria/${CATEGORY_SLUGS[previous.category]}`);
    }

    return NextResponse.json({ post });
  } catch (error) {
    console.error(error);
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
    const post = await getPostByIdAdmin(id);
    await deletePost(id);

    revalidatePath("/blog");
    if (post) {
      revalidatePath(`/blog/${post.slug}`);
      revalidatePath(`/blog/categoria/${CATEGORY_SLUGS[post.category]}`);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Não foi possível excluir o post" },
      { status: 401 },
    );
  }
}
