import { redirect } from "next/navigation";
import { getAllPostsAdmin } from "@/lib/db-blog-admin";
import { BlogAdminList } from "@/components/admin/BlogAdminList";

export default async function AdminBlogPage() {
  let posts;
  try {
    posts = await getAllPostsAdmin();
  } catch {
    redirect("/login");
  }

  return <BlogAdminList initialPosts={posts} />;
}
