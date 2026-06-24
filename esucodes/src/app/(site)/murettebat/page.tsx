"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, FolderOpen, CalendarDays, Sparkles, ArrowRight, Code2, Link2, UserPlus, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeading } from "@/components/GradientHeading";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MemberCardSkeleton } from "@/components/Skeleton";

type TeamMember = {
  id: string; name: string; role_title: string; bio: string | null;
  skills: string[]; github_url: string | null; linkedin_url: string | null; order_index: number;
};

const MEMBER_COLORS = ["#818cf8", "#22d3ee", "#a78bfa"];
function getMemberColor(name: string) { return MEMBER_COLORS[name.charCodeAt(0) % MEMBER_COLORS.length]; }

function MiniStars() {
  const stars = Array.from({ length: 40 }, (_, i) => ({ id: i, left: (i * 43 + 7) % 100, top: (i * 67 + 11) % 100, size: i % 4 === 0 ? 2 : 1.5, op: 0.1 + (i % 5) * 0.06 }));
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {stars.map((s) => <div key={s.id} style={{ position: "absolute", left: `${s.left}%`, top: `${s.top}%`, width: s.size, height: s.size, borderRadius: 9999, background: "white", opacity: s.op }} />)}
    </div>
  );
}

function MemberCard({ member, onOpen }: { member: TeamMember; onOpen: (m: TeamMember) => void }) {
  const [hover, setHover] = useState(false);
  const color   = getMemberColor(member.name);
  const initial = member.name[0];

  return (
    <button onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onClick={() => onOpen(member)}
      style={{ all: "unset", cursor: "pointer", display: "flex", flexDirection: "column", borderRadius: 20, overflow: "hidden", background: hover ? "var(--glass-fill-strong)" : "var(--glass-fill)", border: `1px solid ${hover ? color + "55" : "var(--border-subtle)"}`, transition: "all 0.28s ease", boxShadow: hover ? `0 8px 40px ${color}18` : "0 2px 12px rgba(0,0,0,0.3)", transform: hover ? "translateY(-6px)" : "translateY(0)" }}
    >
      <div style={{ height: 3, background: `linear-gradient(90deg, ${color}, transparent)` }} />
      <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", flexGrow: 1 }}>
        <div style={{ width: 80, height: 80, borderRadius: 9999, marginBottom: 20, background: `linear-gradient(135deg, ${color}30, ${color}60)`, border: `2px solid ${color}50`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 900, color, boxShadow: hover ? `0 0 24px ${color}40` : "none", transition: "box-shadow 0.28s" }}>{initial}</div>

        <h3 style={{ fontSize: 21, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 6px" }}>{member.name}</h3>
        <p style={{ fontSize: 13, fontWeight: 700, color, margin: "0 0 16px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{member.role_title}</p>
        {member.bio && <p style={{ fontSize: 14, color: "var(--text-secondary)", margin: "0 0 20px", lineHeight: 1.65, flexGrow: 1 }}>{member.bio}</p>}

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6, marginBottom: 20 }}>
          {member.skills.slice(0, 4).map((s) => (
            <span key={s} style={{ fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 9999, background: `${color}18`, border: `1px solid ${color}35`, color, fontFamily: "var(--font-mono)" }}>{s}</span>
          ))}
        </div>

        <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", gap: 12, color: "var(--text-muted)" }}>
            {member.github_url   && <a href={member.github_url}   onClick={(e) => e.stopPropagation()} style={{ color: "var(--text-muted)", display: "flex" }}><Code2 size={18} /></a>}
            {member.linkedin_url && <a href={member.linkedin_url} onClick={(e) => e.stopPropagation()} style={{ color: "var(--text-muted)", display: "flex" }}><Link2 size={18} /></a>}
          </div>
          <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color }}>Profil <ArrowRight size={16} color={color} /></span>
        </div>
      </div>
    </button>
  );
}

function MemberModal({ member, onClose }: { member: TeamMember; onClose: () => void }) {
  const color   = getMemberColor(member.name);
  const initial = member.name[0];

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 620, background: "var(--bg-secondary)", border: `1px solid ${color}30`, borderRadius: 24, padding: "36px", boxShadow: `0 0 80px ${color}20`, maxHeight: "88vh", overflowY: "auto", position: "relative" }}>
        <button onClick={onClose} style={{ position: "absolute", top: 20, right: 20, background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={24} /></button>
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
          <div style={{ width: 72, height: 72, borderRadius: 9999, flexShrink: 0, background: `linear-gradient(135deg, ${color}40, ${color}80)`, border: `2px solid ${color}60`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, fontWeight: 900, color, boxShadow: `0 0 24px ${color}30` }}>{initial}</div>
          <div>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 4px" }}>{member.name}</h2>
            <p style={{ fontSize: 12, fontWeight: 700, color, margin: "0 0 8px", letterSpacing: "0.04em", textTransform: "uppercase" }}>{member.role_title}</p>
            {member.bio && <p style={{ color: "var(--text-secondary)", fontSize: 14, margin: 0, lineHeight: 1.65 }}>{member.bio}</p>}
          </div>
        </div>

        {member.skills.length > 0 && (
          <div style={{ padding: 20, borderRadius: 14, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", marginBottom: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 14px" }}>Yetenekler</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {member.skills.map((s) => <span key={s} style={{ fontSize: 13, fontWeight: 600, padding: "5px 12px", borderRadius: 9999, background: `${color}18`, border: `1px solid ${color}35`, color, fontFamily: "var(--font-mono)" }}>{s}</span>)}
            </div>
          </div>
        )}

        {(member.github_url || member.linkedin_url) && (
          <div style={{ display: "flex", gap: 10 }}>
            {member.github_url && <a href={member.github_url} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}><Code2 size={15} /> GitHub</a>}
            {member.linkedin_url && <a href={member.linkedin_url} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", borderRadius: 10, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", textDecoration: "none", fontSize: 13, fontWeight: 600 }}><Link2 size={15} /> LinkedIn</a>}
          </div>
        )}
      </div>
    </div>
  );
}

export default function TeamPage() {
  const [members, setMembers]         = useState<TeamMember[]>([]);
  const [projectCount, setProjectCount] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [selected, setSelected]       = useState<TeamMember | null>(null);

  useEffect(() => {
    createClient().from("team_members").select("*").order("order_index")
      .then(({ data }) => { setMembers((data as TeamMember[]) ?? []); setLoading(false); });
  }, []);

  useEffect(() => {
    createClient().from("projects").select("id", { count: "exact", head: true })
      .then(({ count }) => setProjectCount(count ?? 0));
  }, []);

  const stats = [
    { value: members.length,     label: "Kurucu Üye",  icon: Users },
    { value: projectCount + "+", label: "Aktif Proje", icon: FolderOpen },
    { value: "2023",             label: "Kuruluş",     icon: CalendarDays },
    { value: "∞",                label: "Merak",        icon: Sparkles },
  ];

  return (
    <div>
      {selected && <MemberModal member={selected} onClose={() => setSelected(null)} />}

      <section style={{ position: "relative", padding: "100px 24px 72px", textAlign: "center", overflow: "hidden" }}>
        <MiniStars />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(129,140,248,0.12) 0%, transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative", zIndex: 10, maxWidth: 700, margin: "0 auto" }}>
          <GradientHeading as="h1" size="7xl" gradient="galactic" align="center" glow>Ekip</GradientHeading>
          <p style={{ fontSize: 20, color: "var(--text-secondary)", marginTop: 16, lineHeight: 1.65 }}>
            Yazılım evrenini birlikte keşfedenler.<br />
            <span style={{ color: "var(--accent-primary)" }}>Küçük ekip, büyük hedefler.</span>
          </p>
        </div>
      </section>

      <section style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)", padding: "28px 24px" }}>
        <div className="grid-4" style={{ maxWidth: "var(--container-max)", margin: "0 auto", gap: 24 }}>
          {stats.map((s) => (
            <div key={s.label} style={{ display: "flex", alignItems: "center", gap: 14, justifyContent: "center" }}>
              <span style={{ color: "var(--accent-primary)" }}><s.icon size={26} /></span>
              <div>
                <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "72px 24px" }}>
        {loading ? (
          <div className="grid-3" style={{ gap: 28, marginBottom: 64 }}>
            {Array.from({ length: 3 }).map((_, i) => <MemberCardSkeleton key={i} />)}
          </div>
        ) : members.length === 0 ? (
          <div style={{ textAlign: "center", padding: 80, color: "var(--text-muted)" }}>
            <div style={{ fontSize: 36, marginBottom: 12 }}>🌌</div>
            <p>Henüz ekip üyesi eklenmemiş.</p>
          </div>
        ) : (
          <ScrollReveal>
            <div className="grid-3" style={{ gap: 28, marginBottom: 64 }}>
              {members.map((m) => <MemberCard key={m.id} member={m} onOpen={setSelected} />)}
            </div>
          </ScrollReveal>
        )}

        <div style={{ padding: "48px", borderRadius: 24, textAlign: "center", background: "linear-gradient(135deg, rgba(129,140,248,0.10) 0%, rgba(34,211,238,0.07) 100%)", border: "1px solid rgba(129,140,248,0.25)" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>👨‍🚀</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: "var(--text-primary)", margin: "0 0 10px" }}>Mürettebata Katıl</h2>
          <p style={{ fontSize: 16, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.65 }}>Ekibimiz büyüyor. Sen de yazılım evrenini birlikte keşfetmek ister misin?</p>
          <Link href="/katil" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, textDecoration: "none", background: "var(--accent-primary)", color: "var(--bg-primary)", fontSize: 15, fontWeight: 700 }}>
            <UserPlus size={18} /> Başvur
          </Link>
        </div>
      </section>
    </div>
  );
}
