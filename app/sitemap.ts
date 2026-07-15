import type { MetadataRoute } from "next";
import { BASE_URL } from "@/lib/schema";
import { SERVICE_AREAS } from "@/lib/site-data";
import { BLOG_CATEGORIES, CATEGORY_SLUGS, getAllPosts } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "monthly", priority: 1 },
    { url: `${BASE_URL}/sobre`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/contato`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE_URL}/blog`, changeFrequency: "weekly", priority: 0.7 },
    {
      url: `${BASE_URL}/politica-de-privacidade`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${BASE_URL}/termos-de-uso`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const serviceRoutes: MetadataRoute.Sitemap = SERVICE_AREAS.map((area) => ({
    url: `${BASE_URL}/${area.slug}`,
    changeFrequency: "monthly",
    priority: 0.9,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = BLOG_CATEGORIES.map(
    (category) => ({
      url: `${BASE_URL}/blog/categoria/${CATEGORY_SLUGS[category]}`,
      changeFrequency: "weekly",
      priority: 0.5,
    }),
  );

  const postRoutes: MetadataRoute.Sitemap = (await getAllPosts()).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt ?? post.date,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...serviceRoutes, ...categoryRoutes, ...postRoutes];
}
