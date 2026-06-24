"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Terminal, LogOut, LayoutDashboard } from "lucide-react";
import { NAV } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";

export function SiteHeader() {
  const pathname = usePathname();
  const router   = useRouter();

  const [loggedIn, setLoggedIn]     = useState(false);
  const [canAccessAdmin, setCanAccessAdmin] = useState(false);

  // onAuthStateChange Supabase'in lokal oturum kopyasını okuyarak abone olur
  // anında (INITIAL_SESSION) tetiklenir; ekstra bir ağ çağrısı gerektirmez.
  useEffect(() => {
    const supabase = createClient();
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setLoggedIn(!!session);
      if (!session) { setCanAccessAdmin(false); return; }
      // Sadece giriş yapmış kullanıcı için, mevcut /api/auth/is-admin endpoint'i tekrar kullanılır.
      fetch("/api/auth/is-admin")
        .then((res) => res.json())
        .then((data: { isAdmin: boolean }) => setCanAccessAdmin(data.isAdmin))
        .catch(() => setCanAccessAdmin(false));
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  };

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

        {loggedIn ? (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {canAccessAdmin && (
              <Link href="/admin" style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "7px 16px", borderRadius: 9999,
                background: "rgba(129,140,248,0.12)", border: "1px solid rgba(129,140,248,0.4)",
                color: "var(--accent-primary)", fontSize: 14, fontWeight: 700, textDecoration: "none",
                transition: "all 0.22s ease",
              }}>
                <LayoutDashboard size={16} /> Panel
              </Link>
            )}
            <button onClick={handleLogout} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "7px 16px", borderRadius: 9999,
              background: "rgba(248,113,113,0.12)", border: "1px solid rgba(248,113,113,0.4)",
              color: "#f87171", fontSize: 14, fontWeight: 700,
              cursor: "pointer", transition: "all 0.22s ease",
            }}>
              <LogOut size={16} /> Çıkış
            </button>
          </div>
        ) : (
          <Link href="/giris" style={{
            display: "flex", alignItems: "center", gap: 8,
            padding: "7px 16px", borderRadius: 9999,
            background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.4)",
            color: "var(--accent-tertiary)", fontSize: 14, fontWeight: 700, textDecoration: "none",
            transition: "all 0.22s ease",
          }}>
            <Terminal size={16} /> Giriş
          </Link>
        )}
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
