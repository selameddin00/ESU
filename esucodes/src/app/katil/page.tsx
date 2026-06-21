"use client";
import { useState } from "react";
import Link from "next/link";
import { Monitor, Server, Shield, Cpu, PenLine, FlaskConical, CheckCircle, ChevronLeft, ChevronRight, Send, Sparkles, Rocket, BookOpen, Users, Star } from "lucide-react";
import { JOIN_ROLES } from "@/lib/data";
import { GradientHeading } from "@/components/GradientHeading";

const STEP_LABELS = ["Kimsin?", "İlgi Alanın", "Motivasyon"];
const LEVELS = ["Öğrenci", "Junior", "Mid-level", "Senior", "Hobbyist"];

const ICONS: Record<string, React.ElementType> = { Monitor, Server, Shield, Cpu, PenLine, FlaskConical };

function StepIndicator({ current }: { current: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, justifyContent: "center", marginBottom: 40 }}>
      {STEP_LABELS.map((label, i) => {
        const done   = i < current;
        const active = i === current;
        return (
          <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 9999,
                display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700,
                background: done ? "var(--accent-primary)" : active ? "var(--glass-fill-strong)" : "var(--glass-fill)",
                border: `2px solid ${done || active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                color: done ? "var(--bg-primary)" : active ? "var(--accent-primary)" : "var(--text-muted)",
                transition: "all 0.25s",
              }}>
                {done ? <CheckCircle size={16} /> : i + 1}
              </div>
              <span style={{ fontSize: 12, color: active ? "var(--text-primary)" : "var(--text-muted)", fontWeight: active ? 600 : 400 }}>{label}</span>
            </div>
            {i < STEP_LABELS.length - 1 && (
              <div style={{ width: 48, height: 2, marginBottom: 20, background: i < current ? "var(--accent-primary)" : "var(--border-subtle)", borderRadius: 2, transition: "background 0.4s" }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function SuccessScreen({ name, onHome }: { name: string; onHome: () => void }) {
  const [count, setCount] = useState(5);
  useState(() => {
    const t = setInterval(() => {
      setCount((c) => {
        if (c <= 1) { clearInterval(t); onHome(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  });

  return (
    <div style={{ minHeight: "80vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 560 }}>
        <div style={{ fontSize: 72, marginBottom: 24 }}>🚀</div>
        <GradientHeading as="h1" size="5xl" gradient="galactic" align="center" glow>Başvurun Alındı!</GradientHeading>
        <p style={{ fontSize: 18, color: "var(--text-secondary)", marginTop: 16, lineHeight: 1.7 }}>
          Teşekkürler, <strong style={{ color: "var(--text-primary)" }}>{name}</strong>!<br />
          Başvurunu inceleyip en kısa sürede sana geri döneceğiz. Galaksiyi beraber keşfedelim.
        </p>
        <p style={{ fontSize: 14, color: "var(--text-muted)", marginTop: 32 }}>
          {count} saniyede anasayfaya yönlendiriliyorsun...
        </p>
      </div>
    </div>
  );
}

export default function JoinPage() {
  const [step, setStep]           = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm]           = useState({ name: "", email: "", github: "", roles: [] as string[], message: "", level: "" });

  const set = (key: string, val: unknown) => setForm((f) => ({ ...f, [key]: val }));
  const toggleRole = (id: string) => set("roles", form.roles.includes(id) ? form.roles.filter((r) => r !== id) : [...form.roles, id]);

  const canNext = [
    form.name.trim().length > 1 && form.email.includes("@"),
    form.roles.length > 0 && !!form.level,
    form.message.trim().length > 10,
  ];

  const PERKS = [
    { icon: Rocket,   color: "#818cf8", title: "Gerçek Projeler", text: "Sahte değil, gerçekten çalışan projelerde yer al." },
    { icon: BookOpen, color: "#22d3ee", title: "Öğren ve Öğret",  text: "Blog yaz, bildiklerini paylaş, yenilerini öğren." },
    { icon: Users,    color: "#a78bfa", title: "Topluluk",         text: "Aynı tutkuyu paylaşan insanlarla bağlantı kur." },
    { icon: Star,     color: "#fb923c", title: "Kendi Projen",     text: "Fikirlerini burada hayata geçirebilirsin." },
  ];

  if (submitted) return <SuccessScreen name={form.name} onHome={() => { window.location.href = "/"; }} />;

  return (
    <div>
      {/* Hero */}
      <section style={{ padding: "80px 24px 56px", textAlign: "center", background: "linear-gradient(180deg, rgba(129,140,248,0.07) 0%, transparent 100%)" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 18px", borderRadius: 9999, background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.3)", marginBottom: 20 }}>
            <Sparkles size={14} color="var(--accent-tertiary)" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "var(--accent-tertiary)" }}>Yeni üye alımı açık</span>
          </div>
          <GradientHeading as="h1" size="7xl" gradient="galactic" align="center" glow>Galaksiye Katıl</GradientHeading>
          <p style={{ fontSize: 20, color: "var(--text-secondary)", marginTop: 16, lineHeight: 1.65 }}>
            Yazılım öğrencisi misin? ESUcodes ekibine katılarak gerçek projeler üret,<br />
            blog yaz ve topluluğumuzun bir parçası ol.
          </p>
        </div>
      </section>

      {/* Perks */}
      <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "0 24px 64px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {PERKS.map((p) => (
            <div key={p.title} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 12, padding: "24px 20px", borderRadius: 16, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
              <p.icon size={26} color={p.color} />
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>{p.title}</div>
                <div style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.55 }}>{p.text}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px 120px" }}>
        <div style={{ padding: "40px 36px", borderRadius: 24, background: "var(--glass-fill-strong)", border: "1px solid rgba(129,140,248,0.25)" }}>
          <StepIndicator current={step} />

          {/* Step 0 */}
          {step === 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {[
                { label: "İsim Soyisim *",   key: "name",   type: "text",  placeholder: "Ada Lovelace",     mono: false },
                { label: "E-posta *",         key: "email",  type: "email", placeholder: "ada@universe.com", mono: false },
                { label: "GitHub (isteğe bağlı)", key: "github", type: "text", placeholder: "github-username",  mono: true  },
              ].map(({ label, key, type, placeholder, mono }) => (
                <div key={key}>
                  <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={(form as unknown as Record<string, string>)[key]}
                    onChange={(e) => set(key, e.target.value)}
                    style={{ width: "100%", padding: "13px 16px", borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 15, fontFamily: mono ? "var(--font-mono)" : "var(--font-sans)", outline: "none", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                    onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Step 1 */}
          {step === 1 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>Hangi alanlarda katkı sağlamak istersin? *</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {JOIN_ROLES.map((role) => {
                    const active = form.roles.includes(role.id);
                    const Icon = ICONS[role.icon] || Monitor;
                    return (
                      <button key={role.id} onClick={() => toggleRole(role.id)} style={{
                        all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 14,
                        padding: "16px 20px", borderRadius: 14,
                        background: active ? role.color + "18" : "var(--glass-fill)",
                        border: `1.5px solid ${active ? role.color : "var(--border-subtle)"}`,
                        transition: "all 0.2s",
                      }}>
                        <Icon size={22} color={active ? role.color : "var(--text-muted)"} />
                        <span style={{ fontSize: 15, fontWeight: 600, color: active ? "var(--text-primary)" : "var(--text-secondary)" }}>{role.label}</span>
                        {active && <CheckCircle size={18} color={role.color} style={{ marginLeft: "auto" }} />}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 12 }}>Deneyim Seviyesi *</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                  {LEVELS.map((l) => {
                    const active = form.level === l;
                    return (
                      <button key={l} onClick={() => set("level", l)} style={{
                        all: "unset", cursor: "pointer", padding: "8px 18px", borderRadius: 9999, fontSize: 14, fontWeight: 600,
                        background: active ? "var(--accent-primary)" : "var(--glass-fill)",
                        border: `1px solid ${active ? "var(--accent-primary)" : "var(--border-subtle)"}`,
                        color: active ? "var(--bg-primary)" : "var(--text-secondary)",
                        transition: "all 0.2s",
                      }}>{l}</button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <div>
                <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Neden ESUcodes? *</label>
                <textarea
                  rows={7}
                  placeholder="ESUcodes'a katılmak istememin sebebi..."
                  value={form.message}
                  onChange={(e) => set("message", e.target.value)}
                  style={{ width: "100%", padding: "14px 16px", fontFamily: "var(--font-sans)", fontSize: 15, color: "var(--text-primary)", lineHeight: 1.65, background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", borderRadius: 12, outline: "none", resize: "vertical", transition: "border-color 0.2s", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                  onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
                />
                <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "6px 0 0", textAlign: "right" }}>{form.message.length} karakter</p>
              </div>
              <div style={{ padding: "16px 20px", borderRadius: 12, background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)", fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.8 }}>
                <strong style={{ color: "var(--text-primary)" }}>{form.name}</strong> · {form.email}
                {form.github && <span> · <span style={{ fontFamily: "var(--font-mono)" }}>@{form.github}</span></span>}
                <br />
                {form.level} · {form.roles.map((id) => JOIN_ROLES.find((r) => r.id === id)?.label).join(", ")}
              </div>
            </div>
          )}

          {/* Nav */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: 32, paddingTop: 24, borderTop: "1px solid var(--border-subtle)" }}>
            {step > 0 ? (
              <button onClick={() => setStep((s) => s - 1)} style={{ all: "unset", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)", fontSize: 15, fontWeight: 600 }}>
                <ChevronLeft size={18} /> Geri
              </button>
            ) : <div />}
            {step < STEP_LABELS.length - 1 ? (
              <button onClick={() => canNext[step] && setStep((s) => s + 1)} disabled={!canNext[step]} style={{ all: "unset", cursor: canNext[step] ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 6, padding: "10px 24px", borderRadius: 10, background: canNext[step] ? "var(--accent-primary)" : "var(--glass-fill)", border: `1px solid ${canNext[step] ? "var(--accent-primary)" : "var(--border-subtle)"}`, color: canNext[step] ? "var(--bg-primary)" : "var(--text-muted)", fontSize: 15, fontWeight: 700, opacity: canNext[step] ? 1 : 0.5 }}>
                Devam <ChevronRight size={18} />
              </button>
            ) : (
              <button onClick={() => canNext[2] && setSubmitted(true)} disabled={!canNext[2]} style={{ all: "unset", cursor: canNext[2] ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 10, background: canNext[2] ? "linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))" : "var(--glass-fill)", color: canNext[2] ? "#fff" : "var(--text-muted)", fontSize: 15, fontWeight: 700, opacity: canNext[2] ? 1 : 0.5 }}>
                <Send size={18} /> Başvuruyu Gönder
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
