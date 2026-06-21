"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Terminal } from "lucide-react";
import { NAV } from "@/lib/data";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header style={{
      position: "sticky", top: 0, zIndex: 50,
      background: "rgba(15,23,42,0.88)",
      backdropFilter: "blur(16px)",
      WebkitBackdropFilter: "blur(16px)",
      borderBottom: "1px solid var(--border-subtle)",
    }}>
      <div style={{
        maxWidth: "var(--container-max)", margin: "0 auto",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16,
      }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <span className="esu-gradient-text" style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.01em" }}>
            ESUCODES
          </span>
        </Link>

        <nav className="desktop-only-nav" style={{ display: "flex", alignItems: "center", gap: 28 }}>
          {NAV.map((link) => (
            <NavLink key={link.id} href={link.href} active={pathname === link.href} highlight={link.id === "join"}>
              {link.label}
            </NavLink>
          ))}
        </nav>

        <Link href="/giris" style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "7px 16px", borderRadius: 9999,
          background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.4)",
          color: "var(--accent-tertiary)", fontSize: 14, fontWeight: 700, textDecoration: "none",
          transition: "all 0.22s ease",
        }}>
          <Terminal size={16} /> Giriş
        </Link>
      </div>
    </header>
  );
}

function NavLink({ children, href, active, highlight }: {
  children: React.ReactNode;
  href: string;
  active: boolean;
  highlight?: boolean;
}) {
  const [hover, setHover] = useState(false);

  if (highlight) {
    return (
      <Link href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
        background: active ? "var(--accent-primary)" : hover ? "rgba(129,140,248,0.15)" : "transparent",
        border: `1px solid ${active ? "var(--accent-primary)" : "rgba(129,140,248,0.4)"}`,
        borderRadius: 9999, padding: "5px 16px",
        fontSize: 14, fontWeight: 700, textDecoration: "none",
        color: active ? "var(--bg-primary)" : "var(--accent-primary)",
        transition: "all var(--dur-base)",
      }}>
        {children}
      </Link>
    );
  }

  return (
    <Link href={href} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
      position: "relative", textDecoration: "none",
      fontSize: 15, padding: "4px 0",
      color: active || hover ? "var(--text-primary)" : "var(--text-secondary)",
      transition: "color var(--dur-base)",
    }}>
      {children}
      <span style={{
        position: "absolute", bottom: -2, left: 0, height: 2, borderRadius: 2,
        width: active || hover ? "100%" : 0, background: "var(--accent-primary)",
        transition: "width var(--dur-base)", display: "block",
      }} />
    </Link>
  );
}
