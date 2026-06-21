import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { PostCard } from "@/components/PostCard";
import type { DbPost } from "@/components/PostCard";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GradientHeading } from "@/components/GradientHeading";
import { createClient } from "@/lib/supabase/server";

export async function RecentPosts() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, read_time, published_at, profiles(full_name, username)")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(3);

  const posts = (data ?? []) as unknown as DbPost[];

  if (posts.length === 0) return null;

  return (
    <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "96px 24px 72px" }}>
      <ScrollReveal>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 48 }}>
          <div>
            <GradientHeading as="h2" size="5xl">Son Loglar</GradientHeading>
            <p style={{ color: "var(--text-secondary)", marginTop: 8, fontSize: 17 }}>
              Yazılım evreninden son haberler
            </p>
          </div>
          <Link href="/blog" style={{
            display: "flex", alignItems: "center", gap: 6, textDecoration: "none",
            fontSize: 14, fontWeight: 600, color: "var(--accent-primary)",
          }}>
            Tümü <ArrowRight size={16} />
          </Link>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 28 }}>
          {posts.map((p) => <PostCard key={p.id} post={p} />)}
        </div>
      </ScrollReveal>
    </section>
  );
}
