"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Terminal, Eye, EyeOff, LogIn } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { GradientHeading } from "@/components/GradientHeading";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError("E-posta veya şifre hatalı.");
      setLoading(false);
      return;
    }

    const res = await fetch("/api/auth/is-admin");
    const { isAdmin } = await res.json() as { isAdmin: boolean };
    router.push(isAdmin ? "/admin" : "/");
    router.refresh();
  };

  const inputStyle = {
    width: "100%", padding: "13px 16px", borderRadius: 12,
    background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
    color: "var(--text-primary)", fontSize: 15, outline: "none",
    transition: "border-color 0.2s", boxSizing: "border-box" as const,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 16, background: "rgba(129,140,248,0.15)", border: "1px solid rgba(129,140,248,0.3)", marginBottom: 20 }}>
            <Terminal size={26} color="var(--accent-primary)" />
          </div>
          <GradientHeading as="h1" size="4xl" gradient="accent" align="center">Giriş Yap</GradientHeading>
          <p style={{ color: "var(--text-muted)", marginTop: 8, fontSize: 15 }}>
            Hesabın yok mu?{" "}
            <Link href="/kayit" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>Kayıt ol</Link>
          </p>
        </div>

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 18, padding: "36px 32px", borderRadius: 20, background: "var(--glass-fill-strong)", border: "1px solid rgba(129,140,248,0.2)" }}>
          {error && (
            <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(239,68,68,0.12)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171", fontSize: 14 }}>
              {error}
            </div>
          )}

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>E-posta</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ada@universe.com"
              style={inputStyle}
              onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
              onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "var(--text-secondary)", marginBottom: 8 }}>Şifre</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"} required value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ ...inputStyle, paddingRight: 46 }}
                onFocus={(e) => (e.target.style.borderColor = "var(--accent-primary)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle)")}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}>
                {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit" disabled={loading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "13px", borderRadius: 12, background: "var(--accent-primary)", color: "var(--bg-primary)", fontSize: 15, fontWeight: 700, border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1, marginTop: 4 }}
          >
            <LogIn size={18} /> {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>
        </form>
      </div>
    </div>
  );
}
