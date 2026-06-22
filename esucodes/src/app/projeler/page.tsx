"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Globe, Bot, LayoutDashboard, Orbit, FolderOpen, Users, CalendarDays, Sparkles, Code2, ExternalLink, UserPlus, GitMerge } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeading } from "@/components/GradientHeading";
import { ScrollReveal } from "@/components/ScrollReveal";
import { ProjectCardSkeleton } from "@/components/Skeleton";

type Project = {
  id: string; name: string; tagline: string | null; description: string | null;
  tech: string[]; status: string; github_url: string | null; live_url: string | null;
  icon: string; accent_color: string; order_index: number;
};

const ICONS: Record<string, React.ElementType> = { Globe, Bot, LayoutDashboard, Orbit, FolderOpen };

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  live:        { label: "Canlı",           color: "#22d3ee" },
  development: { label: "Geliştiriliyor",  color: "#818cf8" },
  archived:    { label: "Arşiv",           color: "#64748b" },
  private:     { label: "Gizli",           color: "#f87171" },
};

function StarfieldMini() {
  const stars = Array.from({ length: 40 }, (_, i) => ({ id: i, x: (i * 43 + 7) % 100, y: (i * 67 + 11) % 100, r: i % 3 === 0 ? 1.5 : 1, op: 0.2 + (i % 5) * 0.08 }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
        {stars.map((s) => <circle key={s.id} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r} fill="white" opacity={s.op} />)}
      </svg>
    </div>
  );
}

function ProjectCard({ project }: { project: Project }) {
  const [hover, setHover] = useState(false);
  const status = STATUS_MAP[project.status] ?? { label: project.status, color: "#64748b" };
  const Icon   = ICONS[project.icon] ?? Globe;

  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display: "flex", flexDirection: "column", background: hover ? "var(--glass-fill-strong)" : "var(--glass-fill)", border: `1px solid ${hover ? project.accent_color : "var(--border-subtle)"}`, borderRadius: 20, padding: 32, transition: "all 0.25s ease", boxShadow: hover ? `0 0 32px ${project.accent_color}22` : "none", transform: hover ? "translateY(-4px)" : "translateY(0)" }}
    >
      <div style={{ width: 56, height: 56, borderRadius: 16, marginBottom: 20, background: project.accent_color + "20", border: `1px solid ${project.accent_color}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Icon size={28} color={project.accent_color} />
      </div>

      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 8 }}>
        <h3 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>{project.name}</h3>
        <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, background: status.color + "20", color: status.color, flexShrink: 0, marginTop: 4 }}>{status.label}</span>
      </div>

      {project.tagline && <p style={{ fontSize: 13, fontWeight: 600, color: project.accent_color, margin: "0 0 12px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{project.tagline}</p>}

      {project.description && <p style={{ fontSize: 15, color: "var(--text-secondary)", lineHeight: 1.65, margin: "0 0 20px", flexGrow: 1 }}>{project.description}</p>}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {project.tech.map((t) => <span key={t} style={{ fontSize: 12, fontWeight: 500, padding: "4px 10px", borderRadius: 9999, fontFamily: "var(--font-mono)", background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>{t}</span>)}
      </div>

      <div style={{ display: "flex", gap: 12, paddingTop: 20, borderTop: "1px solid var(--border-subtle)" }}>
        {project.github_url && <a href={project.github_url} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: "var(--text-muted)", textDecoration: "none" }}><Code2 size={16} /> GitHub</a>}
        {project.live_url   && <a href={project.live_url}   style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, color: project.accent_color, textDecoration: "none" }}><ExternalLink size={16} /> Canlı</a>}
        {!project.github_url && !project.live_url && <span style={{ fontSize: 14, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>🔒 gizli</span>}
      </div>
    </div>
  );
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    createClient().from("projects").select("*").order("order_index")
      .then(({ data }) => { setProjects((data as Project[]) ?? []); setLoading(false); });
  }, []);

  const stats = [
    { value: projects.length + "+", label: "Proje",      icon: FolderOpen },
    { value: "3",                    label: "Kurucu Üye", icon: Users },
    { value: "2023",                 label: "Kuruluş",    icon: CalendarDays },
    { value: "∞",                   label: "Merak",        icon: Sparkles },
  ];

  return (
    <div>
      <section style={{ position: "relative", padding: "100px 24px 64px", textAlign: "center", overflow: "hidden" }}>
        <StarfieldMini />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 800, margin: "0 auto" }}>
          <GradientHeading as="h1" size="7xl" gradient="galactic" align="center" glow>Projeler</GradientHeading>
          <p style={{ fontSize: 20, color: "var(--text-secondary)", marginTop: 16, lineHeight: 1.65 }}>Yazılım evrenini şekillendirmek için yaptıklarımız. Küçük adımlar, büyük hedefler.</p>
        </div>
      </section>

      <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", padding: "32px 24px" }}>
        <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 16, justifyContent: "center" }}>
              <span style={{ color: "var(--accent-primary)" }}><s.icon size={28} /></span>
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 4 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "80px 24px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 28 }}>
            {Array.from({ length: 4 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : projects.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌌</div>
            <p>Henüz proje eklenmemiş.</p>
          </div>
        ) : (
          <ScrollReveal>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 28 }}>
              {projects.map((p) => <ProjectCard key={p.id} project={p} />)}
            </div>
          </ScrollReveal>
        )}
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto 80px", padding: "48px", borderRadius: 24, background: "linear-gradient(135deg, rgba(129,140,248,0.12) 0%, rgba(34,211,238,0.08) 100%)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
        <span style={{ color: "var(--accent-primary)", marginBottom: 16, display: "block" }}><GitMerge size={36} /></span>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 12px" }}>Birlikte inşa edelim</h2>
        <p style={{ fontSize: 17, color: "var(--text-secondary)", margin: "0 0 28px", lineHeight: 1.65 }}>Projelerimize katkıda bulunmak ister misin? Ekibimize katılabilirsin.</p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
          <Link href="/katil" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, textDecoration: "none", background: "var(--accent-primary)", color: "var(--bg-primary)", fontSize: 15, fontWeight: 700 }}>
            <UserPlus size={18} /> Ekibe Katıl
          </Link>
          <a href="https://github.com" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, textDecoration: "none", background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 15, fontWeight: 700 }}>
            <Code2 size={18} /> GitHub
          </a>
        </div>
      </section>
    </div>
  );
}
