import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";

type Post = {
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  published_at: string | null;
  profiles: { full_name: string | null } | null;
};

function escape(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

export async function GET() {
  const supabase = await createAdminClient();
  const { data: posts } = await supabase
    .from("posts")
    .select("title, slug, excerpt, category, published_at, profiles(full_name)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(25);

  const items = ((posts as unknown as Post[]) ?? [])
    .filter((p) => p.published_at)
    .map((p) => {
      const author = (p.profiles as { full_name: string | null } | null)?.full_name ?? "ESUcodes";
      return `
    <item>
      <title><![CDATA[${p.title}]]></title>
      <link>${BASE}/blog/${escape(p.slug)}</link>
      <guid isPermaLink="true">${BASE}/blog/${escape(p.slug)}</guid>
      <description><![CDATA[${p.excerpt ?? ""}]]></description>
      <pubDate>${new Date(p.published_at!).toUTCString()}</pubDate>
      <category>${escape(p.category)}</category>
      <author>${escape(author)}</author>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"
  xmlns:atom="http://www.w3.org/2005/Atom"
  xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>ESUcodes Blog</title>
    <link>${BASE}</link>
    <description>Yazılım öğrencilerinin kurduğu Türkçe açık bilgi platformu — siber güvenlik, yapay zeka, frontend ve gömülü sistemler.</description>
    <language>tr</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${BASE}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${BASE}/og-image.png</url>
      <title>ESUcodes</title>
      <link>${BASE}</link>
    </image>${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
