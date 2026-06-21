"use client";
import { useState } from "react";
import Link from "next/link";
import { Code2, Link2, Share2 } from "lucide-react";
import { NAV } from "@/lib/data";

export function SiteFooter() {
  const [mars, setMars] = useState(false);
  return (
    <footer style={{ borderTop: "1px solid var(--border-subtle)", background: "var(--bg-secondary)" }}>
      <div style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "56px 24px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 48, marginBottom: 48 }}>
          <div>
            <Link href="/" style={{ textDecoration: "none", display: "block", marginBottom: 16 }}>
              <span className="esu-gradient-text" style={{ fontSize: 20, fontWeight: 800 }}>ESUCODES</span>
            </Link>
            <p style={{ color: "var(--text-secondary)", fontSize: 15, margin: "0 0 20px", lineHeight: 1.65, maxWidth: 280 }}>
              Yazılım öğrencilerinin kurduğu açık bilgi ve proje platformu. Keşfet, öğren, paylaş.
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              {[Code2, Link2, Share2].map((Icon, i) => (
                <SocialBtn key={i} Icon={Icon} />
              ))}
            </div>
          </div>

          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700, margin: "0 0 16px", letterSpacing: "0.08em", textTransform: "uppercase" }}>Platform</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {NAV.map((n) => (
                <li key={n.id}>
                  <Link href={n.href} style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none" }}>
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 style={{ color: "var(--text-primary)", fontSize: 13, fontWeight: 700, margin: "0 0 16px", letterSpacing: "0.08em", textTransform: "uppercase" }}>İletişim</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              <li><span style={{ color: "var(--text-secondary)", fontSize: 14 }}>contact@esucodes.com</span></li>
              <li><Link href="/katil" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none" }}>Ekibe Katıl</Link></li>
              <li><Link href="#" style={{ color: "var(--text-secondary)", fontSize: 14, textDecoration: "none" }}>GitHub</Link></li>
            </ul>
          </div>
        </div>

        <div style={{ paddingTop: 24, borderTop: "1px solid var(--border-subtle)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>© 2025 ESUCODES · Explore Software Universe</p>
          <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
            Made on{" "}
            <span
              onMouseEnter={() => setMars(true)}
              onMouseLeave={() => setMars(false)}
              style={{ cursor: "pointer", color: mars ? "var(--accent-tertiary)" : "var(--text-secondary)", transition: "color 0.2s" }}
            >
              {mars ? "Mars 🚀" : "Earth 🌍"}
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialBtn({ Icon }: { Icon: React.ElementType }) {
  const [hover, setHover] = useState(false);
  return (
    <span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      width: 36, height: 36, borderRadius: 9999,
      display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
      background: hover ? "var(--glass-fill-strong)" : "var(--glass-fill)",
      border: `1px solid ${hover ? "var(--accent-primary)" : "var(--border-subtle)"}`,
      color: hover ? "var(--accent-primary)" : "var(--text-muted)",
      transition: "all var(--dur-base)",
    }}>
      <Icon size={18} />
    </span>
  );
}
