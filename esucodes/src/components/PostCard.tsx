"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CAT_COLORS } from "@/lib/data";

export type DbPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  category: string;
  read_time: string | null;
  published_at: string | null;
  profiles?: { full_name: string | null; username: string | null } | null;
};

export function PostCard({ post }: { post: DbPost }) {
  const [hover, setHover] = useState(false);
  const cat    = CAT_COLORS[post.category] || CAT_COLORS["AI"];
  const author = post.profiles?.full_name ?? post.profiles?.username ?? "ESUcodes";
  const init   = author[0];
  const date   = post.published_at
    ? new Date(post.published_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short" })
    : "";

  return (
    <Link href={`/blog/${post.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", flexDirection: "column", textDecoration: "none",
        borderRadius: 18, overflow: "hidden", height: "100%",
        background: hover ? "var(--glass-fill-strong)" : "var(--glass-fill)",
        border: `1px solid ${hover ? cat.hex + "55" : "var(--border-subtle)"}`,
        transition: "all 0.24s ease",
        boxShadow: hover ? `0 8px 36px ${cat.hex}18` : "0 2px 12px rgba(0,0,0,0.25)",
        transform: hover ? "translateY(-4px)" : "none",
      }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${cat.hex}, transparent)`, flexShrink: 0 }} />
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
          <ArrowRight size={16} color={hover ? cat.hex : "var(--text-muted)"} style={{ transition: "color 0.2s" }} />
        </div>
      </div>
    </Link>
  );
}

export function CategoryBadge({ cat }: { cat: string }) {
  const c = CAT_COLORS[cat] || CAT_COLORS["AI"];
  return (
    <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, background: c.hex + "20", border: `1px solid ${c.hex}40`, color: c.hex, letterSpacing: "0.04em" }}>{cat}</span>
  );
}
