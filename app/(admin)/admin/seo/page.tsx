import { redirect } from "next/navigation";
import { getAllPageSeoAdmin } from "@/lib/db-page-seo";
import { PageSeoList } from "@/components/admin/PageSeoList";

export default async function SeoPage() {
  let pages;
  try {
    pages = await getAllPageSeoAdmin();
  } catch {
    redirect("/login");
  }

  return <PageSeoList initialPages={pages} />;
}
