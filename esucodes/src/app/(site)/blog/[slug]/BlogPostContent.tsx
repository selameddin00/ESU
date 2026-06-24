import Link from "next/link";
import dynamic from "next/dynamic";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import { CAT_COLORS } from "@/lib/data";
import { CategoryBadge } from "@/components/PostCard";
import { ShareButtons } from "./ShareButtons";

const CommentSection = dynamic(
  () => import("@/components/CommentSection").then((m) => ({ default: m.CommentSection })),
  { ssr: false }
);

export type DbPost = {
  id: string; title: string; slug: string; excerpt: string | null;
  content: string; category: string; status: string;
  published_at: string | null; read_time: string | null; cover_image: string | null;
  profiles?: { full_name: string | null; username: string | null } | null;
};

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";

export function BlogPostContent({ post, related }: { post: DbPost; related: DbPost[] }) {
  const author        = post.profiles?.full_name ?? post.profiles?.username ?? "ESUcodes";
  const authorInitial = author[0] ?? "E";
  const cat           = CAT_COLORS[post.category] || CAT_COLORS["AI"];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt ?? "",
    image: post.cover_image ?? `${BASE_URL}/og-image.png`,
    url: `${BASE_URL}/blog/${post.slug}`,
    datePublished: post.published_at ?? undefined,
    author: { "@type": "Person", name: author, url: `${BASE_URL}` },
    publisher: { "@type": "Organization", name: "ESUcodes", url: BASE_URL },
    inLanguage: "tr",
    keywords: [post.category, "yazılım", "ESUcodes"],
  };

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* Hero */}
      <div style={{ background: "linear-gradient(180deg, rgba(129,140,248,0.10) 0%, transparent 100%)", borderBottom: "1px solid var(--border-subtle)", padding: "56px 24px 48px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto" }}>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", marginBottom: 28, fontSize: 14, fontWeight: 600, color: "var(--accent-primary)" }}>
            <ArrowLeft size={16} /> Blog&apos;a Dön
          </Link>

          <div style={{ marginBottom: 20 }}><CategoryBadge cat={post.category} /></div>

          <h1 style={{ fontSize: "clamp(28px, 5vw, 48px)", fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.15, margin: "16px 0 24px", letterSpacing: "-0.02em" }}>
            {post.title}
          </h1>

          {post.excerpt && (
            <p style={{ fontSize: 18, color: "var(--text-secondary)", lineHeight: 1.65, margin: "0 0 28px", maxWidth: 680 }}>{post.excerpt}</p>
          )}

          {post.cover_image && (
            <img src={post.cover_image} alt={post.title} style={{ width: "100%", maxHeight: 400, objectFit: "cover", borderRadius: 16, marginBottom: 28, border: "1px solid var(--border-subtle)" }} />
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 24, flexWrap: "wrap" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9999, background: `linear-gradient(135deg, ${cat.hex}60, ${cat.hex}90)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff" }}>{authorInitial}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{author}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>ESUcodes Ekibi</div>
              </div>
            </div>
            <div style={{ width: 1, height: 32, background: "var(--border-subtle)" }} />
            <div style={{ display: "flex", gap: 20 }}>
              {post.published_at && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                  <Calendar size={15} />
                  {new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              {post.read_time && (
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                  <Clock size={15} /> {post.read_time} okuma
                </span>
              )}
            </div>
            <div style={{ marginLeft: "auto" }}>
              <ShareButtons />
            </div>
          </div>
        </div>
      </div>

      {/* Content + Sidebar */}
      <div className="post-layout" style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "56px 24px 80px" }}>
        <article>
          <div className="tiptap-content" dangerouslySetInnerHTML={{ __html: post.content }} />

          <div style={{ marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "var(--text-muted)" }}>Etiketler:</span>
            {[post.category, "ESUcodes", "Yazılım"].map((tag) => (
              <span key={tag} style={{ fontSize: 13, padding: "4px 12px", borderRadius: 9999, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>{tag}</span>
            ))}
          </div>

          <div style={{ marginTop: 40, padding: "28px 32px", borderRadius: 16, background: "linear-gradient(135deg, rgba(129,140,248,0.10), rgba(34,211,238,0.06))", border: "1px solid rgba(129,140,248,0.25)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>Bu içerik işine yaradı mı?</div>
              <div style={{ fontSize: 14, color: "var(--text-secondary)" }}>ESUcodes blog yazılarını takip et, bilgi evreninde kaybolma.</div>
            </div>
            <Link href="/katil" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 10, textDecoration: "none", background: "var(--accent-primary)", color: "var(--bg-primary)", fontSize: 14, fontWeight: 700, flexShrink: 0 }}>Takip Et</Link>
          </div>

          <CommentSection postId={post.id} />
        </article>

        {/* Sidebar */}
        <aside style={{ display: "flex", flexDirection: "column", gap: 24, position: "sticky", top: 80 }}>
          <div style={{ padding: 24, borderRadius: 16, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px" }}>Yazar</h3>
            <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <div style={{ width: 48, height: 48, borderRadius: 9999, background: `linear-gradient(135deg, ${cat.hex}50, ${cat.hex}80)`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 900, color: "#fff" }}>{authorInitial}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{author}</div>
                <div style={{ fontSize: 13, color: "var(--accent-primary)" }}>ESUcodes Ekibi</div>
              </div>
            </div>
          </div>

          {related.length > 0 && (
            <div style={{ padding: 24, borderRadius: 16, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase", margin: "0 0 16px" }}>İlgili Loglar</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {related.map((r) => (
                  <Link key={r.id} href={`/blog/${r.slug}`} style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: 6, padding: "14px 16px", borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)" }}>
                    <CategoryBadge cat={r.category} />
                    <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", lineHeight: 1.4 }}>{r.title}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{r.read_time}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
