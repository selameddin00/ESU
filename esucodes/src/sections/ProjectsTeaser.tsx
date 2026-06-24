"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { FolderOpen, Globe, Bot, LayoutDashboard, Orbit, ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GradientHeading } from "@/components/GradientHeading";
import { ProjectItemSkeleton } from "@/components/Skeleton";

type Project = {
  id: string; name: string; tagline: string | null; description: string | null;
  tech: string[]; status: string; icon: string; accent_color: string; order_index: number;
};

const ICONS: Record<string, React.ElementType> = { Globe, Bot, LayoutDashboard, Orbit };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  live:        { label: "Canlı",          color: "#22d3ee" },
  development: { label: "Geliştiriliyor", color: "#818cf8" },
  archived:    { label: "Arşiv",          color: "#64748b" },
  private:     { label: "Gizli",          color: "#f87171" },
};

function ProjectItem({ project }: { project: Project }) {
  const [hover, setHover] = useState(false);
  const status = STATUS_MAP[project.status] ?? { label: project.status, color: "#64748b" };
  const Icon   = ICONS[project.icon] ?? Globe;
  const color  = project.accent_color;

  return (
    <Link href="/projeler"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex", alignItems: "center", gap: 18, padding: "18px 22px",
        borderRadius: 14, textDecoration: "none",
        background: hover ? "var(--glass-fill-strong)" : "var(--glass-fill)",
        border: `1px solid ${hover ? color + "55" : "var(--border-subtle)"}`,
        transition: "all 0.22s",
        boxShadow: hover ? `0 0 24px ${color}18` : "none",
      }}
    >
      <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: color + "18", border: `1px solid ${color}35`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={22} color={color} />
      </div>
      <div style={{ flexGrow: 1, minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
          <span style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{project.name}</span>
          <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 9999, background: status.color + "20", color: status.color, letterSpacing: "0.04em", flexShrink: 0 }}>{status.label}</span>
        </div>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {project.description ?? project.tagline}
        </p>
      </div>
      <ChevronRight size={16} color={hover ? color : "var(--text-muted)"} style={{ flexShrink: 0 }} />
    </Link>
  );
}

export function ProjectsTeaser() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    createClient()
      .from("projects")
      .select("id, name, tagline, description, tech, status, icon, accent_color, order_index")
      .order("order_index")
      .limit(3)
      .then(({ data }) => { setProjects((data as Project[]) ?? []); setLoading(false); });
  }, []);

  return (
    <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
      <div className="grid-2" style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "80px 24px", gap: 64, alignItems: "center" }}>
        <ScrollReveal>
          <GradientHeading as="h2" size="5xl">Projelerimiz</GradientHeading>
          <p style={{ color: "var(--text-secondary)", fontSize: 17, marginTop: 12, marginBottom: 32, lineHeight: 1.7 }}>
            Söylemekle kalmayıp yaparız. Platform geliştirme, robot tasarımı, proje yönetim araçları — yazılım evrenini inşa ediyoruz.
          </p>
          <Link href="/projeler" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "11px 24px", borderRadius: 12, textDecoration: "none",
            background: "var(--glass-fill)", border: "1px solid var(--border-subtle)",
            color: "var(--text-primary)", fontSize: 15, fontWeight: 700,
            backdropFilter: "blur(8px)", transition: "border-color 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = "var(--accent-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = "var(--border-subtle)")}>
            <FolderOpen size={18} /> Tüm Projeleri Gör
          </Link>
        </ScrollReveal>

        <ScrollReveal delay={0.15}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {loading
              ? Array.from({ length: 3 }).map((_, i) => <ProjectItemSkeleton key={i} />)
              : projects.map((p) => <ProjectItem key={p.id} project={p} />)
            }
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
