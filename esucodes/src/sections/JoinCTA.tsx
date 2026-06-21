import Link from "next/link";
import { UserPlus, Users } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { GradientHeading } from "@/components/GradientHeading";

export function JoinCTA() {
  return (
    <section style={{ maxWidth: "var(--container-max)", margin: "0 auto", padding: "96px 24px 80px" }}>
      <ScrollReveal>
        <div style={{
          position: "relative", overflow: "hidden",
          padding: "72px 56px", borderRadius: 28, textAlign: "center",
          background: "linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(129,140,248,0.10) 50%, rgba(6,182,212,0.10) 100%)",
          border: "1px solid rgba(139,92,246,0.30)",
        }}>
          {/* Stars */}
          {Array.from({ length: 16 }, (_, i) => (
            <div key={i} style={{
              position: "absolute",
              left: `${(i * 41 + 7) % 100}%`, top: `${(i * 67 + 13) % 100}%`,
              width: i % 3 === 0 ? 3 : 2, height: i % 3 === 0 ? 3 : 2,
              borderRadius: 9999, background: "white", opacity: 0.12 + (i % 4) * 0.05,
              pointerEvents: "none",
            }} />
          ))}

          <div style={{ position: "relative", zIndex: 1 }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🚀</div>
            <GradientHeading as="h2" size="6xl" gradient="galactic" align="center" glow>Galaksiye Katıl</GradientHeading>
            <p style={{ fontSize: 19, color: "var(--text-secondary)", marginTop: 16, marginBottom: 40, lineHeight: 1.7, maxWidth: 580, marginLeft: "auto", marginRight: "auto" }}>
              Yazılım öğrencisi misin? ESUcodes ekibine katılarak gerçek projeler üret, bilgini paylaş ve topluluğumuzun bir parçası ol.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/katil" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 28px", borderRadius: 12, textDecoration: "none",
                background: "linear-gradient(135deg, var(--accent-primary), var(--accent-tertiary))",
                color: "#fff", fontSize: 16, fontWeight: 700,
              }}>
                <UserPlus size={20} /> Hemen Başvur
              </Link>
              <Link href="/murettebat" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "13px 28px", borderRadius: 12, textDecoration: "none",
                background: "var(--glass-fill)", border: "1px solid var(--border-subtle)",
                color: "var(--text-primary)", fontSize: 16, fontWeight: 700,
                backdropFilter: "blur(8px)",
              }}>
                <Users size={20} /> Ekibi Tanı
              </Link>
            </div>
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
