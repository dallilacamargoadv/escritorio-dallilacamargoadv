import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { createPost, getAllPostsAdmin, type PostInput } from "@/lib/db-blog-admin";
import { slugify, BLOG_CATEGORIES, CATEGORY_SLUGS } from "@/lib/blog";

export async function GET() {
  try {
    const posts = await getAllPostsAdmin();
    return NextResponse.json({ posts });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível carregar os posts" },
      { status: 401 },
    );
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const title = typeof body?.title === "string" ? body.title.trim() : "";
  const subtitle = typeof body?.subtitle === "string" ? body.subtitle.trim() : "";
  const category = body?.category;
  const content = typeof body?.content === "string" ? body.content : "";
  const published = Boolean(body?.published);
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
    slug: slugify(title),
    title,
    subtitle,
    category,
    content,
    published,
    meta_title: metaTitle,
    meta_description: metaDescription,
  };

  try {
    const post = await createPost(input);
    revalidatePath("/blog");
    revalidatePath(`/blog/${post.slug}`);
    revalidatePath(`/blog/categoria/${CATEGORY_SLUGS[post.category]}`);
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o post" },
      { status: 401 },
    );
  }
}
