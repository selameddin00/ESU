"use client";
import { useState, useEffect } from "react";
import { MessageSquare, Send, CheckCircle } from "lucide-react";

type Comment = {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
};

const COLORS = ["#818cf8", "#22d3ee", "#a78bfa", "#34d399", "#fb923c"];
const color = (name: string) => COLORS[name.charCodeAt(0) % COLORS.length];

export function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [form, setForm]         = useState({ author_name: "", author_email: "", content: "" });
  const [loading, setLoading]   = useState(true);
  const [sending, setSending]   = useState(false);
  const [sent, setSent]         = useState(false);
  const [error, setError]       = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/comments?post_id=${postId}`)
      .then((r) => r.json())
      .then((d) => { setComments(Array.isArray(d) ? d : []); })
      .catch(() => { setComments([]); })
      .finally(() => setLoading(false));
  }, [postId]);

  const setField = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.author_name.trim() || !form.author_email.trim() || !form.content.trim()) {
      setError("Tüm alanları doldur."); return;
    }
    setSending(true); setError(null);
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, ...form }),
    });
    setSending(false);
    if (res.ok) {
      setSent(true);
      setForm({ author_name: "", author_email: "", content: "" });
    } else {
      const d = await res.json();
      setError(d.error ?? "Bir hata oluştu.");
    }
  };

  return (
    <section style={{ marginTop: 64, paddingTop: 48, borderTop: "1px solid var(--border-subtle)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 36 }}>
        <MessageSquare size={22} color="var(--accent-primary)" />
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "var(--text-primary)", margin: 0 }}>
          Yorumlar {!loading && comments.length > 0 && <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text-muted)" }}>({comments.length})</span>}
        </h2>
      </div>

      {/* Comment list */}
      {loading ? (
        <div style={{ color: "var(--text-muted)", fontSize: 14, marginBottom: 32 }}>Yükleniyor...</div>
      ) : comments.length === 0 ? (
        <div style={{ color: "var(--text-muted)", fontSize: 15, marginBottom: 40, textAlign: "center", padding: "28px 0" }}>
          Henüz yorum yok. İlk yorumu sen yap!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 48 }}>
          {comments.map((c) => {
            const col = color(c.author_name ?? "");
            const init = (c.author_name?.[0] ?? "?").toUpperCase();
            const date = new Date(c.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" });
            return (
              <div key={c.id} style={{ display: "flex", gap: 14, padding: "18px 20px", borderRadius: 14, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
                <div style={{ width: 38, height: 38, borderRadius: 9999, flexShrink: 0, background: `${col}20`, border: `1px solid ${col}40`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: col }}>{init}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>{c.author_name}</span>
                    <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{date}</span>
                  </div>
                  <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.7, margin: 0 }}>{c.content}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Comment form */}
      <div style={{ padding: "28px 24px", borderRadius: 16, background: "linear-gradient(135deg, rgba(129,140,248,0.07) 0%, rgba(34,211,238,0.04) 100%)", border: "1px solid var(--border-subtle)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, color: "var(--text-primary)", margin: "0 0 20px" }}>Yorum Yap</h3>

        {sent ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 18px", borderRadius: 12, background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.25)" }}>
            <CheckCircle size={20} color="#22d3ee" />
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#22d3ee" }}>Yorumun alındı!</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>İnceleme sonrası yayınlanacak.</div>
            </div>
            <button onClick={() => setSent(false)} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--accent-primary)", fontFamily: "var(--font-sans)" }}>Başka yorum yap</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div className="grid-2" style={{ gap: 14 }}>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>AD SOYAD *</label>
                <input value={form.author_name} onChange={(e) => setField("author_name", e.target.value)} placeholder="Ahmet Yılmaz"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                  onBlur={(e)  => (e.target.style.borderColor = "var(--border-subtle)")} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>E-POSTA *</label>
                <input type="email" value={form.author_email} onChange={(e) => setField("author_email", e.target.value)} placeholder="ahmet@example.com"
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                  onBlur={(e)  => (e.target.style.borderColor = "var(--border-subtle)")} />
              </div>
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--text-muted)", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase" }}>YORUM *</label>
              <textarea value={form.content} onChange={(e) => setField("content", e.target.value)} placeholder="Düşüncelerini paylaş..." rows={4}
                style={{ width: "100%", padding: "10px 14px", borderRadius: 10, background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 14, outline: "none", resize: "vertical", fontFamily: "var(--font-sans)", lineHeight: 1.6, boxSizing: "border-box" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e)  => (e.target.style.borderColor = "var(--border-subtle)")} />
            </div>
            {error && <p style={{ fontSize: 13, color: "#f87171", margin: 0 }}>{error}</p>}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: 0 }}>E-posta adresin yayınlanmaz. Yorum inceleme sonrası görünür.</p>
              <button type="submit" disabled={sending} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 22px", borderRadius: 10, background: "var(--accent-primary)", border: "none", color: "var(--bg-primary)", fontSize: 14, fontWeight: 700, cursor: sending ? "not-allowed" : "pointer", opacity: sending ? 0.7 : 1 }}>
                <Send size={15} /> {sending ? "Gönderiliyor..." : "Gönder"}
              </button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
