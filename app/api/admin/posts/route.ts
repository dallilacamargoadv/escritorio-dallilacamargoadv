import { NextRequest, NextResponse } from "next/server";
import { createPost, getAllPostsAdmin, type PostInput } from "@/lib/db-blog-admin";
import { slugify, BLOG_CATEGORIES } from "@/lib/blog";

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
  };

  try {
    const post = await createPost(input);
    return NextResponse.json({ post });
  } catch {
    return NextResponse.json(
      { error: "Não foi possível criar o post" },
      { status: 401 },
    );
  }
}
