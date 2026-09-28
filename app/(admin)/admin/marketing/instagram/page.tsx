import { redirect } from "next/navigation";
import { getConteudoInstagramSincronizado } from "@/lib/db-conteudo-editorial";
import { InstagramFeedClient } from "@/components/admin/InstagramFeedClient";

export default async function InstagramFeedPage() {
  let posts;
  try {
    posts = await getConteudoInstagramSincronizado(30);
  } catch {
    redirect("/login");
  }

  return <InstagramFeedClient posts={posts} />;
}
