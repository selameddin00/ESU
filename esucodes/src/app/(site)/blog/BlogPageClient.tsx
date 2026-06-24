"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, X, ArrowRight, BookOpen } from "lucide-react";
import { CATEGORIES, CAT_COLORS } from "@/lib/data";
import { GradientHeading } from "@/components/GradientHeading";
import { CategoryBadge } from "@/components/PostCard";
import { PostCardSkeleton } from "@/components/Skeleton";

type DbPost = {
  id: string; title: string; slug: string; excerpt: string | null;
  category: string; status: string; published_at: string | null;
  read_time: string | null; cover_image: string | null;
  profiles?: { full_name: string | null; username: string | null } | null;
};

export function BlogPageClient() {
  const [posts, setPosts]   = useState<DbPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]   = useState("");
  const [cat, setCat]       = useState("Tümü");

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => { setPosts(Array.isArray(data) ? data : []); })
      .catch(() => { setPosts([]); })
      .finally(() => setLoading(false));
  }, []);

  const filtered = posts.filter((p) => {
    const mq = !query || p.title.toLowerCase().includes(query.toLowerCase()) || (p.excerpt ?? "").toLowerCase().includes(query.toLowerCase());
    const mc = cat === "Tümü" || p.category === cat;
    return mq && mc;
  });

  const featured      = posts[0];
  const showFeatured  = !query && cat === "Tümü" && !loading;
  const countFor = (c: string) => c === "Tümü" ? posts.length : posts.filter((p) => p.category === c).length;

  return (
    <div>
      <section style={{ padding: "80px 24px 56px", textAlign: "center", background: "linear-gradient(180deg, rgba(129,140,248,0.07) 0%, transparent 100%)", borderBottom: "1px solid var(--border-subtle)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <GradientHeading as="h1" size="6xl" gradient="galactic" align="center" glow>Blog Kütüphanesi</GradientHeading>
          <p style={{ color: "var(--text-secondary)", fontSize: 18, marginTop: 14, marginBottom: 32 }}>
            Yazılım evreninden tüm içerikler — {posts.length} yazı · {CATEGORIES.length - 1} kategori
          </p>
          <div style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)", pointerEvents: "none" }}>
              <Search size={18} />
            </span>
            <input type="text" placeholder="Evrende bir şey ara..." value={query} onChange={(e) => setQuery(e.target.value)}
              style={{ width: "100%", padding: "14px 44px", borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 15, fontFamily: "var(--font-sans)", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}>
                <X size={16} />
              </button>
            )}
          </div>
        </div>
      </section>

      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginBottom: 48 }}>
          {CATEGORIES.map((c) => <CategoryPill key={c} label={c} active={cat === c} count={countFor(c)} onClick={() => setCat(c)} />)}
        </div>

        {loading ? (
          <div className="blog-card-grid">
            {Array.from({ length: 6 }).map((_, i) => <PostCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {showFeatured && featured && <FeaturedPost post={featured} />}

            {filtered.length > 0 ? (
              <>
                {showFeatured && (
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.08em", textTransform: "uppercase" }}>
                      {cat === "Tümü" ? "Tüm Yazılar" : cat}
                    </span>
                    <div style={{ flex: 1, height: 1, background: "var(--border-subtle)" }} />
                    <span style={{ fontSize: 13, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{filtered.length} yazı</span>
                  </div>
                )}
                <div className="blog-card-grid">
                  {(showFeatured ? filtered.slice(1) : filtered).map((p) => <BlogCard key={p.id} post={p} />)}
                </div>
              </>
            ) : (
              <div style={{ textAlign: "center", padding: "64px 0" }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔭</div>
                <p style={{ fontSize: 18, color: "var(--text-muted)" }}>Bu koordinatlarda içerik bulunamadı.</p>
                <button onClick={() => { setQuery(""); setCat("Tümü"); }} style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", color: "var(--accent-primary)", fontFamily: "var(--font-sans)", fontSize: 15 }}>
                  Tümünü Göster
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function CategoryPill({ label, active, count, onClick }: { label: string; active: boolean; count: number; onClick: () => void }) {
  const [hover, setHover] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 20px", borderRadius: 9999, fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, cursor: "pointer", background: active ? "var(--accent-primary)" : hover ? "rgba(129,140,248,0.10)" : "var(--glass-fill)", border: `1px solid ${active ? "var(--accent-primary)" : hover ? "rgba(129,140,248,0.4)" : "var(--border-subtle)"}`, color: active ? "var(--bg-primary)" : hover ? "var(--accent-primary)" : "var(--text-secondary)", transition: "all 0.2s" }}>
      {label}
      <span style={{ fontSize: 11, fontWeight: 700, minWidth: 18, height: 18, borderRadius: 9999, display: "flex", alignItems: "center", justifyContent: "center", background: active ? "rgba(255,255,255,0.25)" : "var(--bg-secondary)", color: active ? "var(--bg-primary)" : "var(--text-muted)", padding: "0 5px" }}>{count}</span>
    </button>
  );
}

function BlogCard({ post }: { post: DbPost }) {
  const [hover, setHover] = useState(false);
  const cat  = CAT_COLORS[post.category] || CAT_COLORS["AI"];
  const author = post.profiles?.full_name ?? post.profiles?.username ?? "ESUcodes";
  const init = author[0];
  const date = post.published_at ? new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" }) : "";

  return (
    <Link href={`/blog/${post.slug}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", flexDirection: "column", textDecoration: "none", borderRadius: 18, overflow: "hidden", background: hover ? "var(--glass-fill-strong)" : "var(--glass-fill)", border: `1px solid ${hover ? cat.hex + "55" : "var(--border-subtle)"}`, transition: "all 0.24s ease", boxShadow: hover ? `0 8px 36px ${cat.hex}18` : "0 2px 12px rgba(0,0,0,0.25)", transform: hover ? "translateY(-4px)" : "none" }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.hex}, transparent)` }} />
      <div style={{ padding: "22px 22px 20px", display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <CategoryBadge cat={post.category} />
          <span style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{post.read_time}</span>
        </div>
        <h3 style={{ fontSize: 17, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px", lineHeight: 1.4 }}>{post.title}</h3>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.65, margin: "0 0 18px", flexGrow: 1 }}>{post.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ width: 24, height: 24, borderRadius: 9999, background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 900, color: "var(--bg-primary)" }}>{init}</div>
            <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{author}{date ? ` · ${date}` : ""}</span>
          </div>
          <ArrowRight size={16} color={hover ? cat.hex : "var(--text-muted)"} />
        </div>
      </div>
    </Link>
  );
}

function FeaturedPost({ post }: { post: DbPost }) {
  const [hover, setHover] = useState(false);
  const cat = CAT_COLORS[post.category] || CAT_COLORS["AI"];
  const author = post.profiles?.full_name ?? post.profiles?.username ?? "ESUcodes";

  return (
    <Link href={`/blog/${post.slug}`} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "grid", gridTemplateColumns: "1fr 1fr", textDecoration: "none", borderRadius: 20, overflow: "hidden", background: `linear-gradient(135deg, ${cat.hex}12, ${cat.hex}06)`, border: `1px solid ${hover ? cat.hex + "50" : cat.hex + "28"}`, transition: "all 0.28s ease", boxShadow: hover ? `0 0 60px ${cat.hex}20` : `0 0 32px ${cat.hex}10`, marginBottom: 48 }}
    >
      <div style={{ padding: "40px 36px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
          <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.12em", color: cat.hex, padding: "4px 12px", borderRadius: 9999, background: `${cat.hex}20`, border: `1px solid ${cat.hex}40`, textTransform: "uppercase" }}>Öne Çıkan</span>
          <CategoryBadge cat={post.category} />
        </div>
        <h2 style={{ fontSize: "clamp(20px,2.5vw,28px)", fontWeight: 900, color: "var(--text-primary)", margin: "0 0 14px", lineHeight: 1.3 }}>{post.title}</h2>
        <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 24px", flexGrow: 1 }}>{post.excerpt}</p>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: "var(--accent-gradient)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "var(--bg-primary)" }}>{author[0]}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-primary)" }}>{author}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{post.published_at ? new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" }) : ""} · {post.read_time}</div>
            </div>
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, fontWeight: 700, color: cat.hex }}>Oku <ArrowRight size={16} color={cat.hex} /></span>
        </div>
      </div>
      <div style={{ background: `linear-gradient(135deg, ${cat.hex}18, ${cat.hex}06)`, borderLeft: `1px solid ${cat.hex}25`, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 240, position: "relative", overflow: "hidden" }}>
        {[1,2,3,4].map((n) => <div key={n} style={{ position: "absolute", borderRadius: 9999, width: n * 80, height: n * 80, border: `1px solid ${cat.hex}${Math.max(10, 30 - n * 8).toString(16).padStart(2,"0")}` }} />)}
        <div style={{ width: 64, height: 64, borderRadius: 9999, position: "relative", zIndex: 10, background: `linear-gradient(135deg, ${cat.hex}40, ${cat.hex}80)`, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 0 32px ${cat.hex}50` }}>
          <BookOpen size={28} color={cat.hex} />
        </div>
      </div>
    </Link>
  );
}
