"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserPlus, Eye, EyeOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeading } from "@/components/GradientHeading";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ full_name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);
  const [success, setSuccess]   = useState(false);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (form.password !== form.confirm) {
      setError("Şifreler eşleşmiyor.");
      return;
    }
    if (form.password.length < 6) {
      setError("Şifre en az 6 karakter olmalı.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name } },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)", fontSize: 15, outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box" as const,
  };

  if (success) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
      <div style={{ maxWidth: 420 }}>
        <div style={{ fontSize: 64, marginBottom: 20 }}>📬</div>
        <GradientHeading as="h1" size="4xl" gradient="accent" align="center">Neredeyse tamam!</GradientHeading>
        <p style={{ color: "var(--text-secondary)", marginTop: 16, lineHeight: 1.7, fontSize: 16 }}>
          <strong style={{ color: "var(--text-primary)" }}>{form.email}</strong> adresine doğrulama maili gönderdik. Maili onayla ve giriş yap.
        </p>
        <Link href="/giris" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 28, padding: "12px 24px", borderRadius: 12, background: "var(--accent-primary)", color: "var(--bg-primary)", textDecoration: "none", fontWeight: 700 }}>
          Giriş Sayfasına Git
        </Link>
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", marginBottom: 20 }}>
            <UserPlus size={26} color="var(--accent-primary)" />
          </div>
          <GradientHeading as="h1" size="4xl" gradient="accent" align="center">Kayıt Ol</GradientHeading>
          <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 15 }}>
            Zaten hesabın var mı?{" "}
            <Link href="/giris" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>Giriş yap</Link>
          </p>
        </div>

        <form onSubmit={handleRegister} style={{ display: "flex", flexDirection: "column", gap: 16, padding: "36px 32px", borderRadius: 20, background: "var(--glass-fill-strong)", border: "1px solid rgba(129,140,248,0.2)" }}>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 14 }}>
              {error}
            </div>
          )}

          {[
            { label: "Ad Soyad", key: "full_name", type: "text", placeholder: "Ada Lovelace" },
            { label: "E-posta",  key: "email",     type: "email", placeholder: "ada@universe.com" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>{label}</label>
              <input
                type={type} required
                value={(form as Record<string, string>)[key]}
                onChange={(e) => set(key, e.target.value)}
                placeholder={placeholder}
                style={inputStyle}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
            </div>
          ))}

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Şifre</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"} required
                value={form.password} onChange={(e) => set("password", e.target.value)}
                placeholder="En az 6 karakter"
                style={{ ...inputStyle, paddingRight: 46 }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Şifre Tekrar</label>
            <input
              type="password" required
              value={form.confirm} onChange={(e) => set("confirm", e.target.value)}
              placeholder="••••••••"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            />
          </div>

          <button
            type="submit" disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 12, background: "linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))", color: "#fff", fontSize: 15, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            <UserPlus size={18} /> {loading ? "Kayıt yapılıyor..." : "Kayıt Ol"}
          </button>
        </form>
      </div>
    </div>
  );
}
