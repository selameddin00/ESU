import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { BlogPostContent } from "./BlogPostContent";

export const revalidate = 1800; // 30 dakika ISR

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";

type DbPost = {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string; category: string; status: string;
  published_at: string | null; read_time: string | null; cover_image: string | null;
  profiles?: { full_name: string | null; username: string | null } | null;
};

type PostMeta = {
  title: string; excerpt: string | null; cover_image: string | null;
  category: string; published_at: string | null;
  profiles: { full_name: string | null } | null;
};

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const supabase = await createClient();
  const { data: post } = await supabase
    .from("posts")
    .select("title, excerpt, cover_image, category, published_at, profiles(full_name)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!post) return { title: "Yazı Bulunamadı" };

  const p = post as unknown as PostMeta;
  const author = p.profiles?.full_name ?? "ESUcodes";
  const ogImage = p.cover_image ?? `${BASE_URL}/og-image.png`;

  return {
    title: p.title,
    description: p.excerpt ?? `${p.title} — ESUcodes blog yazısı`,
    authors: [{ name: author }],
    openGraph: {
      title: p.title,
      description: p.excerpt ?? `${p.title} — ESUcodes blog yazısı`,
      type: "article",
      url: `${BASE_URL}/blog/${params.slug}`,
      images: [{ url: ogImage, width: 1200, height: 630, alt: p.title }],
      publishedTime: p.published_at ?? undefined,
      authors: [author],
      tags: [p.category, "ESUcodes", "yazılım"],
    },
    twitter: {
      card: "summary_large_image",
      title: p.title,
      description: p.excerpt ?? `${p.title} — ESUcodes blog yazısı`,
      images: [ogImage],
    },
    alternates: {
      canonical: `${BASE_URL}/blog/${params.slug}`,
    },
  };
}

export default async function BlogPostPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const supabase  = await createClient();

  const { data: post } = await supabase
    .from("posts")
    .select("*, profiles(full_name, username)")
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (!post) notFound();

  const { data: related } = await supabase
    .from("posts")
    .select("id, title, slug, category, read_time, published_at")
    .eq("status", "published")
    .neq("id", post.id)
    .limit(3);

  return <BlogPostContent post={post as DbPost} related={(related ?? []) as DbPost[]} />;
}
