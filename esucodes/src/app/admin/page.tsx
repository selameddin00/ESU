"use client";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, FileText, Users, FolderOpen, LogOut,
  Plus, Pencil, Trash2, Eye, EyeOff, CheckCircle, Clock,
  ChevronRight, X, Save, Send, UsersRound, Globe, Bot,
  LayoutDashboard as LDash, Orbit, Shield, MessageSquare, ExternalLink, Inbox, XCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { RichEditor } from "@/components/editor/RichEditor";
import { CATEGORIES, NAV, JOIN_ROLES } from "@/lib/data";
import type { Role } from "@/lib/supabase/types";

type Profile    = { id: string; role: Role; full_name: string | null; username: string | null };
type Post       = { id: string; title: string; slug: string; category: string; status: string; published_at: string | null; read_time: string | null; excerpt?: string; content?: string; cover_image?: string };
type TeamMember = { id: string; name: string; role_title: string; bio: string | null; skills: string[]; github_url: string | null; linkedin_url: string | null; order_index: number };
type Project    = { id: string; name: string; tagline: string | null; description: string | null; tech: string[]; status: string; github_url: string | null; live_url: string | null; icon: string; accent_color: string; order_index: number };

const NAV_ITEMS = [
  { id: "overview",  label: "Genel Bakış",  icon: LayoutDashboard, adminOnly: false },
  { id: "posts",     label: "Yazılar",      icon: FileText,         adminOnly: false },
  { id: "comments",  label: "Yorumlar",     icon: MessageSquare,    adminOnly: true  },
  { id: "applications", label: "Başvurular", icon: Inbox,           adminOnly: true  },
  { id: "team",      label: "Ekip",         icon: UsersRound,       adminOnly: true  },
  { id: "projects",  label: "Projeler",     icon: FolderOpen,       adminOnly: true  },
  { id: "users",     label: "Kullanıcılar", icon: Shield,           adminOnly: true  },
];

const PROJECT_ICONS: Record<string, React.ElementType> = { Globe, Bot, LDash, Orbit, FolderOpen };
const ACCENT_COLORS = ["#818cf8", "#22d3ee", "#a78bfa", "#fb923c", "#f87171", "#34d399"];
const STATUS_OPTIONS = [
  { value: "live",        label: "Canlı" },
  { value: "development", label: "Geliştiriliyor" },
  { value: "archived",    label: "Arşiv" },
  { value: "private",     label: "Gizli" },
];
const ROLE_COLORS: Record<Role, string> = { admin: "#f87171", editor: "#818cf8", member: "#22d3ee" };

function slugify(t: string) {
  return t.toLowerCase().replace(/ğ/g,"g").replace(/ü/g,"u").replace(/ş/g,"s").replace(/ı/g,"i").replace(/ö/g,"o").replace(/ç/g,"c").replace(/[^a-z0-9\s-]/g,"").trim().replace(/\s+/g,"-");
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 14px", borderRadius: 10,
  background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)",
  color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-muted)",
  marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase",
};

// ── Post Editor ────────────────────────────────────────────────────
function PostEditor({ post, onClose, onSave }: { post?: Post; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ title: post?.title ?? "", slug: post?.slug ?? "", excerpt: post?.excerpt ?? "", content: post?.content ?? "", category: post?.category ?? CATEGORIES[0], read_time: post?.read_time ?? "", cover_image: post?.cover_image ?? "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState<string | null>(null);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async (status: "draft" | "published") => {
    if (!form.title.trim() || !form.content.trim()) { setError("Başlık ve içerik zorunlu."); return; }
    setSaving(true); setError(null);
    const res = await fetch(post ? `/api/posts/${post.id}` : "/api/posts", {
      method: post ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, status }),
    });
    if (!res.ok) { const d = await res.json(); setError(d.error ?? "Hata oluştu."); setSaving(false); return; }
    onSave(); onClose();
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)", display: "flex", flexDirection: "column" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-secondary)", flexShrink: 0 }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{post ? "Yazıyı Düzenle" : "Yeni Yazı"}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {error && <span style={{ fontSize: 13, color: "#f87171" }}>{error}</span>}
          <button onClick={() => handleSave("draft")} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14, fontWeight: 600, cursor: "pointer" }}><Save size={15} /> Taslak</button>
          <button onClick={() => handleSave("published")} disabled={saving} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "var(--accent-primary)", border: "none", color: "var(--bg-primary)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}><Send size={15} /> {saving ? "Kaydediliyor..." : "Yayınla"}</button>
          <button onClick={onClose} style={{ width: 34, height: 34, borderRadius: 9999, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--text-muted)" }}><X size={17} /></button>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", flex: 1, overflow: "hidden" }}>
        <div style={{ padding: "24px 28px", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
          <input placeholder="Yazı başlığı..." value={form.title} onChange={(e) => { const v = e.target.value; setForm((f) => ({ ...f, title: v, slug: post ? f.slug : slugify(v) })); }}
            style={{ fontSize: 22, fontWeight: 700, padding: "12px 0", background: "transparent", border: "none", borderBottom: "2px solid var(--border-subtle)", borderRadius: 0, color: "var(--text-primary)", outline: "none", width: "100%" }}
            onFocus={(e) => (e.target.style.borderBottomColor = "var(--accent-primary)")}
            onBlur={(e)  => (e.target.style.borderBottomColor = "var(--border-subtle)")} />
          <textarea placeholder="Kısa özet..." value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} rows={2} style={{ ...inputStyle, resize: "none", lineHeight: 1.6, fontFamily: "var(--font-sans)" }} />
          <RichEditor content={form.content} onChange={(html) => set("content", html)} onReadTimeChange={(t) => set("read_time", t)} />
        </div>
        <div style={{ borderLeft: "1px solid var(--border-subtle)", padding: "20px 16px", overflowY: "auto", background: "var(--bg-secondary)", display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { label: "SLUG", key: "slug", placeholder: "yazi-basligi", mono: true },
            { label: "OKUMA SÜRESİ", key: "read_time", placeholder: "5 dk", mono: false },
            { label: "KAPAK GÖRSELİ URL", key: "cover_image", placeholder: "https://...", mono: false },
          ].map(({ label, key, placeholder, mono }) => (
            <div key={key}><label style={labelStyle}>{label}</label>
              <input value={(form as Record<string,string>)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} style={{ ...inputStyle, fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", fontSize: 13 }} />
            </div>
          ))}
          <div><label style={labelStyle}>KATEGORİ</label>
            <select value={form.category} onChange={(e) => set("category", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {form.cover_image && <img src={form.cover_image} alt="cover" style={{ width: "100%", height: 110, objectFit: "cover", borderRadius: 8, border: "1px solid var(--border-subtle)" }} />}
        </div>
      </div>
    </div>
  );
}

// ── Team Member Editor ─────────────────────────────────────────────
function TeamMemberEditor({ member, onClose, onSave }: { member?: TeamMember; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: member?.name ?? "", role_title: member?.role_title ?? "", bio: member?.bio ?? "", skills: (member?.skills ?? []).join(", "), github_url: member?.github_url ?? "", linkedin_url: member?.linkedin_url ?? "", order_index: String(member?.order_index ?? 0) });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, skills: form.skills.split(",").map((s) => s.trim()).filter(Boolean), order_index: Number(form.order_index) };
    const res = await fetch(member ? `/api/team-members/${member.id}` : "/api/team-members", {
      method: member ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 520, background: "var(--bg-secondary)", borderRadius: 20, border: "1px solid var(--border-subtle)", overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{member ? "Üyeyi Düzenle" : "Yeni Üye Ekle"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "AD SOYAD *",       key: "name",        placeholder: "Ada Lovelace" },
            { label: "ROL / ÜNVAN *",    key: "role_title",  placeholder: "Fullstack Developer" },
            { label: "BİYOGRAFİ",        key: "bio",         placeholder: "Kısa biyografi..." },
            { label: "YETENEKLer (virgülle ayır)", key: "skills", placeholder: "Python, React, Docker" },
            { label: "GITHUB URL",       key: "github_url",  placeholder: "https://github.com/..." },
            { label: "LİNKEDİN URL",     key: "linkedin_url", placeholder: "https://linkedin.com/..." },
            { label: "SIRA",             key: "order_index", placeholder: "0" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}><label style={labelStyle}>{label}</label>
              {key === "bio" ? (
                <textarea value={(form as Record<string,string>)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} rows={3} style={{ ...inputStyle, resize: "none", fontFamily: "var(--font-sans)" }} />
              ) : (
                <input value={(form as Record<string,string>)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} style={inputStyle} />
              )}
            </div>
          ))}
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 10, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer" }}>İptal</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 10, background: "var(--accent-primary)", border: "none", color: "var(--bg-primary)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Project Editor ─────────────────────────────────────────────────
function ProjectEditor({ project, onClose, onSave }: { project?: Project; onClose: () => void; onSave: () => void }) {
  const [form, setForm] = useState({ name: project?.name ?? "", tagline: project?.tagline ?? "", description: project?.description ?? "", tech: (project?.tech ?? []).join(", "), status: project?.status ?? "development", github_url: project?.github_url ?? "", live_url: project?.live_url ?? "", icon: project?.icon ?? "Globe", accent_color: project?.accent_color ?? "#818cf8", order_index: String(project?.order_index ?? 0) });
  const [saving, setSaving] = useState(false);
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    const payload = { ...form, tech: form.tech.split(",").map((s) => s.trim()).filter(Boolean), order_index: Number(form.order_index) };
    const res = await fetch(project ? `/api/projects/${project.id}` : "/api/projects", {
      method: project ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (res.ok) { onSave(); onClose(); }
    setSaving(false);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 560, background: "var(--bg-secondary)", borderRadius: 20, border: "1px solid var(--border-subtle)", maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 24px", borderBottom: "1px solid var(--border-subtle)", flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>{project ? "Projeyi Düzenle" : "Yeni Proje Ekle"}</div>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)" }}><X size={18} /></button>
        </div>
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 14, overflowY: "auto" }}>
          {[
            { label: "PROJE ADI *",         key: "name",        placeholder: "ESUcodes" },
            { label: "KISA TANIM",           key: "tagline",     placeholder: "Galaksinin kütüphanesi" },
            { label: "AÇIKLAMA",             key: "description", placeholder: "Proje hakkında..." },
            { label: "TEKNOLOJİLER (virgülle)", key: "tech",    placeholder: "Next.js, Supabase, TypeScript" },
            { label: "GITHUB URL",           key: "github_url",  placeholder: "https://github.com/..." },
            { label: "CANLI URL",            key: "live_url",    placeholder: "https://..." },
            { label: "SIRA",                 key: "order_index", placeholder: "0" },
          ].map(({ label, key, placeholder }) => (
            <div key={key}><label style={labelStyle}>{label}</label>
              {key === "description" ? (
                <textarea value={(form as Record<string,string>)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} rows={3} style={{ ...inputStyle, resize: "none", fontFamily: "var(--font-sans)" }} />
              ) : (
                <input value={(form as Record<string,string>)[key]} onChange={(e) => set(key, e.target.value)} placeholder={placeholder} style={inputStyle} />
              )}
            </div>
          ))}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><label style={labelStyle}>DURUM</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {STATUS_OPTIONS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div><label style={labelStyle}>İKON</label>
              <select value={form.icon} onChange={(e) => set("icon", e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
                {Object.keys(PROJECT_ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>
          </div>
          <div><label style={labelStyle}>RENK</label>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {ACCENT_COLORS.map((c) => (
                <button key={c} onClick={() => set("accent_color", c)} style={{ width: 32, height: 32, borderRadius: 9999, background: c, border: form.accent_color === c ? "3px solid white" : "3px solid transparent", cursor: "pointer", boxShadow: form.accent_color === c ? `0 0 12px ${c}` : "none" }} />
              ))}
            </div>
          </div>
        </div>
        <div style={{ padding: "14px 24px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "flex-end", gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ padding: "9px 18px", borderRadius: 10, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer" }}>İptal</button>
          <button onClick={handleSave} disabled={saving} style={{ padding: "9px 20px", borderRadius: 10, background: "var(--accent-primary)", border: "none", color: "var(--bg-primary)", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>{saving ? "Kaydediliyor..." : "Kaydet"}</button>
        </div>
      </div>
    </div>
  );
}

// ── Overview Tab ───────────────────────────────────────────────────
function OverviewTab({ stats }: { stats: { published: number; draft: number; users: number; comments: number } }) {
  const cards = [
    { label: "Yayınlanan", value: stats.published, color: "#22d3ee", icon: CheckCircle },
    { label: "Taslak",     value: stats.draft,     color: "#818cf8", icon: Clock },
    { label: "Üye",        value: stats.users,     color: "#a78bfa", icon: Users },
    { label: "Yorum",      value: stats.comments,  color: "#fb923c", icon: FileText },
  ];
  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 24px" }}>Genel Bakış</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16 }}>
        {cards.map((c) => (
          <div key={c.label} style={{ padding: "24px 20px", borderRadius: 16, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
            <c.icon size={22} color={c.color} />
            <div style={{ fontSize: 32, fontWeight: 800, color: "var(--text-primary)", margin: "12px 0 4px", lineHeight: 1 }}>{c.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{c.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Posts Tab ──────────────────────────────────────────────────────
function PostsTab({ role }: { role: Role }) {
  const [posts, setPosts]     = useState<Post[]>([]);
  const [filter, setFilter]   = useState<"all"|"published"|"draft">("all");
  const [editing, setEditing] = useState<Post | "new" | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    const res = await fetch(filter !== "all" ? `/api/posts?status=${filter}` : "/api/posts");
    const data = await res.json();
    setPosts(Array.isArray(data) ? data : []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yazıyı silmek istediğinden emin misin?")) return;
    await fetch(`/api/posts/${id}`, { method: "DELETE" });
    fetchPosts();
  };

  const handleToggleStatus = async (post: Post) => {
    await fetch(`/api/posts/${post.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: post.status === "published" ? "draft" : "published" }) });
    fetchPosts();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Yazılar</h2>
        <div style={{ display: "flex", gap: 10 }}>
          {(["all","published","draft"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border-subtle)", background: filter === f ? "var(--accent-primary)" : "var(--glass-fill)", color: filter === f ? "var(--bg-primary)" : "var(--text-secondary)" }}>
              {f === "all" ? "Tümü" : f === "published" ? "Yayında" : "Taslak"}
            </button>
          ))}
          <button onClick={() => setEditing("new")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "var(--accent-primary)", border: "none", color: "var(--bg-primary)" }}>
            <Plus size={15} /> Yeni Yazı
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Yükleniyor...</div>
      ) : posts.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Henüz yazı yok.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {posts.map((p) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 12, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 9999, flexShrink: 0, background: p.status === "published" ? "rgba(34,211,238,0.15)" : "rgba(129,140,248,0.15)", color: p.status === "published" ? "#22d3ee" : "#818cf8" }}>
                {p.status === "published" ? "Yayında" : "Taslak"}
              </span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.title}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{p.category} · {p.read_time ?? "—"}</div>
              </div>
              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {role === "admin" && (
                  <button onClick={() => handleToggleStatus(p)} title={p.status === "published" ? "Taslağa al" : "Yayınla"} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--glass-fill)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                    {p.status === "published" ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                )}
                <button onClick={() => setEditing(p)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--glass-fill)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                  <Pencil size={15} />
                </button>
                {role === "admin" && (
                  <button onClick={() => handleDelete(p.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}>
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <PostEditor post={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSave={fetchPosts} />}
    </div>
  );
}

// ── Team Tab ───────────────────────────────────────────────────────
function TeamTab() {
  const [members, setMembers]   = useState<TeamMember[]>([]);
  const [editing, setEditing]   = useState<TeamMember | "new" | null>(null);
  const [loading, setLoading]   = useState(true);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/team-members");
    const data = res.ok ? await res.json() : [];
    setMembers(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchMembers(); }, [fetchMembers]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu üyeyi silmek istediğinden emin misin?")) return;
    await fetch(`/api/team-members/${id}`, { method: "DELETE" });
    fetchMembers();
  };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Ekip Üyeleri</h2>
        <button onClick={() => setEditing("new")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "var(--accent-primary)", border: "none", color: "var(--bg-primary)" }}>
          <Plus size={15} /> Üye Ekle
        </button>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Yükleniyor...</div> : members.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Henüz ekip üyesi yok.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {members.map((m) => (
            <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ width: 40, height: 40, borderRadius: 9999, background: "rgba(129,140,248,0.2)", border: "1px solid rgba(129,140,248,0.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "var(--accent-primary)", flexShrink: 0 }}>
                {m.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{m.name}</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>{m.role_title} · {m.skills.slice(0,3).join(", ")}</div>
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={() => setEditing(m)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--glass-fill)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><Pencil size={15} /></button>
                <button onClick={() => handleDelete(m.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}><Trash2 size={15} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing && <TeamMemberEditor member={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSave={fetchMembers} />}
    </div>
  );
}

// ── Projects Tab ───────────────────────────────────────────────────
function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing]   = useState<Project | "new" | null>(null);
  const [loading, setLoading]   = useState(true);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/projects");
    const data = res.ok ? await res.json() : [];
    setProjects(Array.isArray(data) ? data : []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const handleDelete = async (id: string) => {
    if (!confirm("Bu projeyi silmek istediğinden emin misin?")) return;
    await fetch(`/api/projects/${id}`, { method: "DELETE" });
    fetchProjects();
  };

  const STATUS_LABELS: Record<string, string> = { live: "Canlı", development: "Geliştiriliyor", archived: "Arşiv", private: "Gizli" };
  const STATUS_COLORS: Record<string, string> = { live: "#22d3ee", development: "#818cf8", archived: "#64748b", private: "#f87171" };

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Projeler</h2>
        <button onClick={() => setEditing("new")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 700, cursor: "pointer", background: "var(--accent-primary)", border: "none", color: "var(--bg-primary)" }}>
          <Plus size={15} /> Proje Ekle
        </button>
      </div>
      {loading ? <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Yükleniyor...</div> : projects.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Henüz proje yok.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {projects.map((p) => {
            const Icon = PROJECT_ICONS[p.icon] ?? Globe;
            return (
              <div key={p.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${p.accent_color}20`, border: `1px solid ${p.accent_color}40`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={20} color={p.accent_color} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: `${STATUS_COLORS[p.status] ?? "#64748b"}20`, color: STATUS_COLORS[p.status] ?? "#64748b" }}>{STATUS_LABELS[p.status] ?? p.status}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.tech.join(" · ")}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={() => setEditing(p)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid var(--border-subtle)", background: "var(--glass-fill)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}><Pencil size={15} /></button>
                  <button onClick={() => handleDelete(p.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}><Trash2 size={15} /></button>
                </div>
              </div>
            );
          })}
        </div>
      )}
      {editing && <ProjectEditor project={editing === "new" ? undefined : editing} onClose={() => setEditing(null)} onSave={fetchProjects} />}
    </div>
  );
}

// ── Users Tab ──────────────────────────────────────────────────────
function UsersTab() {
  const [users, setUsers]     = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => { setUsers(Array.isArray(data) ? data : []); setLoading(false); });
  }, []);

  const changeRole = async (id: string, role: Role) => {
    setError(null);
    const res = await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      setError(d.error ?? "Rol güncellenemedi.");
      return;
    }
    setUsers((u) => u.map((x) => x.id === id ? { ...x, role } : x));
  };

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 24px" }}>Kullanıcılar</h2>
      {error && <p style={{ fontSize: 13, color: "#f87171", margin: "0 0 16px" }}>{error}</p>}
      {loading ? <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Yükleniyor...</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {users.map((u) => (
            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: 14, padding: "13px 16px", borderRadius: 12, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
              <div style={{ width: 36, height: 36, borderRadius: 9999, background: `${ROLE_COLORS[u.role]}20`, border: `1px solid ${ROLE_COLORS[u.role]}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: ROLE_COLORS[u.role], flexShrink: 0 }}>
                {(u.full_name ?? u.username ?? "?")[0].toUpperCase()}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{u.full_name ?? u.username ?? "İsimsiz"}</div>
              </div>
              <select value={u.role} onChange={(e) => changeRole(u.id, e.target.value as Role)} style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${ROLE_COLORS[u.role]}40`, background: `${ROLE_COLORS[u.role]}15`, color: ROLE_COLORS[u.role], fontSize: 13, fontWeight: 600, cursor: "pointer", outline: "none" }}>
                <option value="member">member</option>
                <option value="editor">editor</option>
                <option value="admin">admin</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Comments Tab ───────────────────────────────────────────────────
type Comment = { id: string; author_name: string; author_email: string; content: string; created_at: string; is_approved: boolean; post_id: string };

function CommentsTab({ onPendingChange }: { onPendingChange: (n: number) => void }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all"|"pending"|"approved">("all");

  const fetchComments = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/comments");
    const data = res.ok ? await res.json() : [];
    const list = Array.isArray(data) ? (data as Comment[]) : [];
    setComments(list);
    onPendingChange(list.filter((c) => !c.is_approved).length);
    setLoading(false);
  }, [onPendingChange]);

  useEffect(() => { fetchComments(); }, [fetchComments]);

  const handleApprove = async (id: string) => {
    await fetch(`/api/comments/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_approved: true }) });
    fetchComments();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu yorumu silmek istediğinden emin misin?")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    fetchComments();
  };

  const shown = comments.filter((c) =>
    filter === "all" ? true : filter === "pending" ? !c.is_approved : c.is_approved
  );

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Yorumlar</h2>
        <div style={{ display: "flex", gap: 8 }}>
          {(["all","pending","approved"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border-subtle)", background: filter === f ? "var(--accent-primary)" : "var(--glass-fill)", color: filter === f ? "var(--bg-primary)" : "var(--text-secondary)" }}>
              {f === "all" ? `Tümü (${comments.length})` : f === "pending" ? `Bekleyen (${comments.filter(c=>!c.is_approved).length})` : `Onaylı (${comments.filter(c=>c.is_approved).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Yükleniyor...</div>
      ) : shown.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Yorum yok.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.map((c) => (
            <div key={c.id} style={{ padding: "16px 18px", borderRadius: 14, background: "var(--glass-fill)", border: `1px solid ${c.is_approved ? "var(--border-subtle)" : "rgba(251,146,60,0.3)"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9999, background: "rgba(129,140,248,0.2)", border: "1px solid rgba(129,140,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "var(--accent-primary)", flexShrink: 0 }}>
                    {c.author_name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{c.author_name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{c.author_email} · {new Date(c.created_at).toLocaleDateString("tr-TR", { day:"numeric", month:"short", year:"numeric" })}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: c.is_approved ? "rgba(34,211,238,0.12)" : "rgba(251,146,60,0.15)", color: c.is_approved ? "#22d3ee" : "#fb923c" }}>
                    {c.is_approved ? "Onaylı" : "Bekliyor"}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  {!c.is_approved && (
                    <button onClick={() => handleApprove(c.id)} title="Onayla" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(34,211,238,0.3)", background: "rgba(34,211,238,0.08)", cursor: "pointer", color: "#22d3ee", fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle size={14} /> Onayla
                    </button>
                  )}
                  <button onClick={() => handleDelete(c.id)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171" }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: "0 0 0 44px" }}>{c.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Applications Tab ───────────────────────────────────────────────
type Application = { id: string; name: string; email: string; github: string | null; roles: string[]; level: string; message: string; status: "yeni" | "incelendi" | "kabul" | "red"; created_at: string };

const APPLICATION_STATUS_LABELS: Record<Application["status"], string> = { yeni: "Yeni", incelendi: "İncelendi", kabul: "Kabul", red: "Red" };
const APPLICATION_STATUS_COLORS: Record<Application["status"], string> = { yeni: "#fb923c", incelendi: "#818cf8", kabul: "#22d3ee", red: "#f87171" };

function ApplicationsTab({ onPendingChange }: { onPendingChange: (n: number) => void }) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading]   = useState(true);
  const [filter, setFilter]     = useState<"all" | Application["status"]>("all");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/admin/applications");
    const data = res.ok ? await res.json() : [];
    const list = Array.isArray(data) ? (data as Application[]) : [];
    setApplications(list);
    onPendingChange(list.filter((a) => a.status === "yeni").length);
    setLoading(false);
  }, [onPendingChange]);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  const handleStatus = async (id: string, status: Application["status"]) => {
    await fetch(`/api/admin/applications/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    fetchApplications();
  };

  const shown = applications.filter((a) => filter === "all" ? true : a.status === filter);

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>Başvurular</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {(["all", "yeni", "incelendi", "kabul", "red"] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)} style={{ padding: "7px 14px", borderRadius: 9999, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1px solid var(--border-subtle)", background: filter === f ? "var(--accent-primary)" : "var(--glass-fill)", color: filter === f ? "var(--bg-primary)" : "var(--text-secondary)" }}>
              {f === "all" ? `Tümü (${applications.length})` : `${APPLICATION_STATUS_LABELS[f]} (${applications.filter((a) => a.status === f).length})`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Yükleniyor...</div>
      ) : shown.length === 0 ? (
        <div style={{ textAlign: "center", padding: 60, color: "var(--text-muted)" }}>Başvuru yok.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {shown.map((a) => (
            <div key={a.id} style={{ padding: "16px 18px", borderRadius: 14, background: "var(--glass-fill)", border: `1px solid ${a.status === "yeni" ? "rgba(251,146,60,0.3)" : "var(--border-subtle)"}` }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 9999, background: "rgba(129,140,248,0.2)", border: "1px solid rgba(129,140,248,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 800, color: "var(--accent-primary)", flexShrink: 0 }}>
                    {a.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{a.name}</div>
                    <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.email} · {new Date(a.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" })}</div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 9999, background: `${APPLICATION_STATUS_COLORS[a.status]}20`, color: APPLICATION_STATUS_COLORS[a.status] }}>
                    {APPLICATION_STATUS_LABELS[a.status]}
                  </span>
                </div>
                <div style={{ display: "flex", gap: 6, flexShrink: 0, flexWrap: "wrap" }}>
                  {a.status !== "incelendi" && (
                    <button onClick={() => handleStatus(a.id, "incelendi")} title="İncelendi" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(129,140,248,0.3)", background: "rgba(129,140,248,0.08)", cursor: "pointer", color: "#818cf8", fontSize: 13, fontWeight: 600 }}>
                      <Eye size={14} /> İncelendi
                    </button>
                  )}
                  {a.status !== "kabul" && (
                    <button onClick={() => handleStatus(a.id, "kabul")} title="Kabul Et" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(34,211,238,0.3)", background: "rgba(34,211,238,0.08)", cursor: "pointer", color: "#22d3ee", fontSize: 13, fontWeight: 600 }}>
                      <CheckCircle size={14} /> Kabul
                    </button>
                  )}
                  {a.status !== "red" && (
                    <button onClick={() => handleStatus(a.id, "red")} title="Reddet" style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.08)", cursor: "pointer", color: "#f87171", fontSize: 13, fontWeight: 600 }}>
                      <XCircle size={14} /> Red
                    </button>
                  )}
                </div>
              </div>
              <div style={{ marginLeft: 44, fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>
                {a.github && <span style={{ fontFamily: "var(--font-mono)" }}>@{a.github} · </span>}
                {a.level} · {a.roles.map((id) => JOIN_ROLES.find((r) => r.id === id)?.label ?? id).join(", ")}
              </div>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.65, margin: "0 0 0 44px" }}>{a.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main ───────────────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab]             = useState("overview");
  const [profile, setProfile]     = useState<Profile | null>(null);
  const [stats, setStats]         = useState({ published: 0, draft: 0, users: 0, comments: 0 });
  const [loading, setLoading]     = useState(true);
  const [pendingComments, setPendingComments] = useState(0);
  const [pendingApplications, setPendingApplications] = useState(0);

  useEffect(() => {
    const init = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/giris"); return; }

      const adminRes = await fetch("/api/auth/is-admin");
      const { isAdmin, role } = await adminRes.json() as { isAdmin: boolean; role: string | null };
      if (!isAdmin) { router.push("/"); return; }

      const { data: p } = await supabase.from("profiles").select("id, full_name, username").eq("id", user.id).single();
      const prof = p as { id: string; full_name: string | null; username: string | null } | null;
      setProfile({
        id:        user.id,
        role:      (role ?? "editor") as Role,
        full_name: prof?.full_name ?? user.email ?? "Admin",
        username:  prof?.username ?? null,
      });

      const { data: s } = await supabase.from("admin_stats").select("*").single();
      const sr = s as { published_posts: number; draft_posts: number; total_users: number; total_comments: number } | null;
      if (sr) setStats({ published: Number(sr.published_posts), draft: Number(sr.draft_posts), users: Number(sr.total_users), comments: Number(sr.total_comments) });

      setLoading(false);
    };
    init();
  }, [router]);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/giris");
    router.refresh();
  };

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)", fontSize: 16 }}>Yükleniyor...</div>
  );

  const visibleNav = NAV_ITEMS.filter((n) => !n.adminOnly || profile?.role === "admin");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{ width: 220, borderRight: "1px solid var(--border-subtle)", padding: "20px 12px", display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <div style={{ padding: "12px 14px", marginBottom: 12, borderRadius: 12, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{profile?.full_name ?? "Kullanıcı"}</div>
          <div style={{ fontSize: 11, fontWeight: 700, color: ROLE_COLORS[profile!.role], marginTop: 2, textTransform: "uppercase", letterSpacing: "0.06em" }}>{profile?.role}</div>
        </div>

        {visibleNav.map((item) => {
          const badgeCount = item.id === "comments" ? pendingComments : item.id === "applications" ? pendingApplications : 0;
          const showBadge = badgeCount > 0;
          return (
            <button key={item.id} onClick={() => setTab(item.id)} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "none", cursor: "pointer", background: tab === item.id ? "rgba(129,140,248,0.15)" : "transparent", color: tab === item.id ? "var(--accent-primary)" : "var(--text-secondary)", fontSize: 14, fontWeight: tab === item.id ? 700 : 500, textAlign: "left", width: "100%", transition: "all 0.15s" }}>
              <item.icon size={17} />
              {item.label}
              {showBadge && (
                <span style={{ marginLeft: 4, minWidth: 18, height: 18, padding: "0 5px", borderRadius: 9999, background: "#fb923c", color: "#0f172a", fontSize: 11, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{badgeCount}</span>
              )}
              {tab === item.id && !showBadge && <ChevronRight size={14} style={{ marginLeft: "auto" }} />}
            </button>
          );
        })}

        <div style={{ flex: 1 }} />

        <div style={{ borderTop: "1px solid var(--border-subtle)", marginTop: 8, paddingTop: 12 }}>
          <div style={{ padding: "0 14px 8px", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Siteyi Görüntüle
          </div>
          {NAV.map((link) => (
            <Link key={link.id} href={link.href} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 14px", borderRadius: 10, color: "var(--text-secondary)", fontSize: 14, fontWeight: 500, textDecoration: "none", transition: "all 0.15s" }}>
              <ExternalLink size={15} />
              {link.label}
            </Link>
          ))}
        </div>

        <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(239,68,68,0.2)", cursor: "pointer", background: "rgba(239,68,68,0.08)", color: "#f87171", fontSize: 14, fontWeight: 600, width: "100%", marginTop: 8 }}>
          <LogOut size={17} /> Çıkış Yap
        </button>
      </aside>

      <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
        {tab === "overview"  && <OverviewTab stats={stats} />}
        {tab === "posts"     && <PostsTab role={profile!.role} />}
        {tab === "comments"  && profile?.role === "admin" && <CommentsTab onPendingChange={setPendingComments} />}
        {tab === "applications" && profile?.role === "admin" && <ApplicationsTab onPendingChange={setPendingApplications} />}
        {tab === "team"      && profile?.role === "admin" && <TeamTab />}
        {tab === "projects"  && profile?.role === "admin" && <ProjectsTab />}
        {tab === "users"     && profile?.role === "admin" && <UsersTab />}
      </main>
    </div>
  );
}
