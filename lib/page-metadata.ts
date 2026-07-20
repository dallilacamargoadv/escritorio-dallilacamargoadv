import type { Metadata } from "next";
import { getPageSeo } from "@/lib/db-page-seo";

export async function getPageMetadata({
  slug,
  path,
  fallbackTitle,
  fallbackDescription,
}: {
  slug: string;
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
}): Promise<Metadata> {
  const seo = await getPageSeo(slug);
  return {
    title: seo?.meta_title || fallbackTitle,
    description: seo?.meta_description || fallbackDescription,
    alternates: { canonical: path },
  };
}
