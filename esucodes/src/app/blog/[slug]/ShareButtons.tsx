"use client";
import { useState } from "react";
import { Share2, Link2 } from "lucide-react";

function ShareBtn({ Icon }: { Icon: React.ElementType }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onClick={() => navigator.clipboard?.writeText(window.location.href)}
      style={{
        width: 34, height: 34, borderRadius: 9999, cursor: "pointer",
        border: `1px solid ${hover ? "var(--accent-primary)" : "var(--border-subtle)"}`,
        background: hover ? "rgba(129,140,248,0.12)" : "var(--glass-fill)",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: hover ? "var(--accent-primary)" : "var(--text-muted)",
        transition: "all 0.2s",
      }}
    >
      <Icon size={16} />
    </button>
  );
}

export function ShareButtons() {
  return (
    <div style={{ display: "flex", gap: 10 }}>
      <ShareBtn Icon={Share2} />
      <ShareBtn Icon={Link2} />
    </div>
  );
}
