import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,                      lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/blog`,            lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
  { url: `${BASE}/projeler`,        lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
  { url: `${BASE}/murettebat`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  { url: `${BASE}/hakkimizda`,      lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/katil`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("slug, updated_at")
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  const postUrls: MetadataRoute.Sitemap = (posts ?? []).map((p) => ({
    url: `${BASE}/blog/${p.slug}`,
    lastModified: new Date(p.updated_at),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...STATIC, ...postUrls];
}
