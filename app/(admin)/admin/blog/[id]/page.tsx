import { notFound, redirect } from "next/navigation";
import { getPostByIdAdmin } from "@/lib/db-blog-admin";
import { PostForm } from "@/components/admin/PostForm";

export default async function EditPostPage(
  props: PageProps<"/admin/blog/[id]">,
) {
  const { id } = await props.params;

  let post;
  try {
    post = await getPostByIdAdmin(id);
  } catch {
    redirect("/login");
  }

  if (!post) notFound();

  return <PostForm post={post} />;
}
