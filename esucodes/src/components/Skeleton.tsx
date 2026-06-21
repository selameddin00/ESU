"use client";

// Base skeleton block
export function Sk({
  w, h, r = 6, mb,
}: {
  w?: string | number;
  h?: string | number;
  r?: number;
  mb?: number;
}) {
  return (
    <div
      className="sk"
      style={{ width: w ?? "100%", height: h ?? 16, borderRadius: r, marginBottom: mb, flexShrink: 0 }}
    />
  );
}

// ── Blog post card skeleton ───────────────────────
export function PostCardSkeleton() {
  return (
    <div style={{ borderRadius: 18, overflow: "hidden", background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", height: "100%" }}>
      <div className="sk" style={{ height: 3, borderRadius: 0 }} />
      <div style={{ padding: "22px 22px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Sk w={80} h={22} r={9999} />
          <Sk w={48} h={14} />
        </div>
        <Sk h={20} r={6} />
        <Sk w="80%" h={20} r={6} />
        <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 4 }}>
          <Sk h={13} />
          <Sk h={13} />
          <Sk w="70%" h={13} />
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px solid var(--border-subtle)", marginTop: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sk w={24} h={24} r={9999} />
            <Sk w={100} h={12} />
          </div>
          <Sk w={16} h={16} r={4} />
        </div>
      </div>
    </div>
  );
}

// ── Team member card skeleton ─────────────────────
export function MemberCardSkeleton() {
  return (
    <div style={{ borderRadius: 20, overflow: "hidden", background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
      <div className="sk" style={{ height: 3, borderRadius: 0 }} />
      <div style={{ padding: "32px 28px", display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <Sk w={80} h={80} r={9999} />
        <Sk w={130} h={22} />
        <Sk w={100} h={14} />
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 6 }}>
          <Sk h={13} />
          <Sk h={13} />
          <Sk w="60%" h={13} />
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 6 }}>
          {[80, 64, 72, 56].map((w, i) => <Sk key={i} w={w} h={22} r={9999} />)}
        </div>
        <div style={{ width: "100%", display: "flex", justifyContent: "space-between", paddingTop: 14, borderTop: "1px solid var(--border-subtle)" }}>
          <div style={{ display: "flex", gap: 10 }}>
            <Sk w={20} h={20} r={4} />
            <Sk w={20} h={20} r={4} />
          </div>
          <Sk w={60} h={16} />
        </div>
      </div>
    </div>
  );
}

// ── Project card skeleton ─────────────────────────
export function ProjectCardSkeleton() {
  return (
    <div style={{ borderRadius: 20, padding: 32, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)", display: "flex", flexDirection: "column", gap: 16 }}>
      <Sk w={56} h={56} r={16} />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Sk w={160} h={24} />
        <Sk w={72} h={22} r={9999} />
      </div>
      <Sk w={120} h={14} />
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <Sk h={14} />
        <Sk h={14} />
        <Sk w="70%" h={14} />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        {[60, 72, 56].map((w, i) => <Sk key={i} w={w} h={26} r={9999} />)}
      </div>
      <div style={{ display: "flex", gap: 14, paddingTop: 16, borderTop: "1px solid var(--border-subtle)" }}>
        <Sk w={72} h={20} />
        <Sk w={56} h={20} />
      </div>
    </div>
  );
}

// ── Project teaser item skeleton ──────────────────
export function ProjectItemSkeleton() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "18px 22px", borderRadius: 14, background: "var(--glass-fill)", border: "1px solid var(--border-subtle)" }}>
      <Sk w={44} h={44} r={12} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Sk w={120} h={16} />
          <Sk w={64} h={16} r={9999} />
        </div>
        <Sk w="80%" h={13} />
      </div>
      <Sk w={16} h={16} r={4} />
    </div>
  );
}
