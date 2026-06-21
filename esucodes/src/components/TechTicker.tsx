import { TICKER } from "@/lib/data";

export function TechTicker() {
  const loop = [...TICKER, ...TICKER, ...TICKER];
  return (
    <section style={{
      background: "var(--bg-secondary)",
      borderBottom: "1px solid var(--border-subtle)",
      padding: "12px 0", overflow: "hidden",
    }}>
      <div style={{
        display: "flex", gap: 56, whiteSpace: "nowrap",
        width: "max-content",
        animation: "esu-ticker 44s linear infinite",
      }}>
        {loop.map((news, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--text-secondary)" }}>
            <span style={{
              width: 6, height: 6, borderRadius: 9999,
              background: "var(--accent-tertiary)", flexShrink: 0, display: "inline-block",
            }} />
            <span style={{ fontSize: 13, fontFamily: "var(--font-mono)" }}>{news}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
