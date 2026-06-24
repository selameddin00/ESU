import Link from "next/link";
import { Home, BookOpen } from "lucide-react";

export default function NotFound() {
  return (
    <div style={{
      minHeight: "calc(100vh - 80px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: 24, position: "relative", overflow: "hidden",
    }}>
      {Array.from({ length: 50 }, (_, i) => (
        <div key={i} style={{
          position: "absolute",
          left: `${(i * 43 + 7) % 100}%`, top: `${(i * 67 + 11) % 100}%`,
          width: i % 5 === 0 ? 3 : 2, height: i % 5 === 0 ? 3 : 2,
          borderRadius: 9999, background: "white",
          opacity: 0.04 + (i % 4) * 0.025, pointerEvents: "none",
        }} />
      ))}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(129,140,248,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", maxWidth: 680 }}>
        {/* Houston meme card */}
        <div style={{
          marginBottom: 36, padding: "28px 32px", borderRadius: 20,
          background: "var(--glass-fill-strong)", border: "1px solid rgba(239,68,68,0.25)",
          boxShadow: "0 0 60px rgba(239,68,68,0.08)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 18 }}>
            <div style={{ fontSize: 52, flexShrink: 0 }}>📡</div>
            <div style={{ textAlign: "left" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "#f87171", textTransform: "uppercase", marginBottom: 6 }}>
                TRANSMISSION LOST — MCC HOUSTON
              </div>
              <div style={{ fontSize: 22, fontWeight: 900, color: "var(--text-primary)", lineHeight: 1.2 }}>
                &quot;Houston, burada bir sorun var.&quot;
              </div>
            </div>
          </div>

          {/* Signal bars */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, justifyContent: "center", marginBottom: 16 }}>
            {[0.2, 0.35, 0.55, 0.75, 1.0].map((h, i) => (
              <div key={i} style={{
                width: 10, height: `${h * 40}px`, borderRadius: 3,
                background: i < 2 ? "#f87171" : "var(--border-subtle)",
                transition: "background 0.3s",
              }} />
            ))}
            <span style={{ marginLeft: 8, fontFamily: "var(--font-mono)", fontSize: 12, color: "#f87171", alignSelf: "center" }}>
              SİNYAL YOK
            </span>
          </div>

          <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--text-muted)", lineHeight: 1.6, textAlign: "left", background: "var(--bg-primary)", padding: "12px 16px", borderRadius: 10, border: "1px solid var(--border-subtle)" }}>
            <div><span style={{ color: "#f87171" }}>ERR</span> 404 — Hedef koordinat bulunamadı</div>
            <div><span style={{ color: "var(--accent-tertiary)" }}>$</span> ping universe.esucodes.com<span style={{ color: "#f87171" }}> — timeout</span></div>
            <div><span style={{ color: "var(--accent-primary)" }}>HINT</span> Bilinen uzaya geri dön<span style={{ animation: "esu-caret 1s steps(1) infinite" }}>_</span></div>
          </div>
        </div>

        <div style={{
          fontSize: "clamp(80px, 16vw, 140px)", fontWeight: 900, lineHeight: 1,
          background: "linear-gradient(135deg, rgba(129,140,248,0.25) 0%, rgba(34,211,238,0.15) 100%)",
          WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
          backgroundClip: "text", marginBottom: 16, letterSpacing: "-0.04em",
        }}>404</div>

        <p style={{ fontSize: 17, color: "var(--text-secondary)", lineHeight: 1.7, margin: "0 0 36px" }}>
          Bu sayfa ya silinmiş, ya taşınmış ya da hiç var olmamış.<br />
          Yazılım evreninde kaybolmak bu kadar kolay.
        </p>

        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, textDecoration: "none", background: "var(--accent-primary)", color: "var(--bg-primary)", fontSize: 15, fontWeight: 700 }}>
            <Home size={18} /> Anasayfaya Dön
          </Link>
          <Link href="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 28px", borderRadius: 12, textDecoration: "none", background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)", fontSize: 15, fontWeight: 700 }}>
            <BookOpen size={18} /> Blog&apos;a Git
          </Link>
        </div>
      </div>
    </div>
  );
}
