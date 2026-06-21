import { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  as?: "h1" | "h2" | "h3" | "h4";
  size?: string;
  gradient?: "accent" | "galactic";
  align?: "left" | "center" | "right";
  glow?: boolean;
  style?: CSSProperties;
}

const SIZE_MAP: Record<string, string> = {
  "4xl": "clamp(28px, 4vw, 36px)",
  "5xl": "clamp(32px, 5vw, 48px)",
  "6xl": "clamp(40px, 7vw, 60px)",
  "7xl": "clamp(48px, 9vw, 72px)",
  "8xl": "clamp(56px, 11vw, 96px)",
};

export function GradientHeading({
  children,
  as: Tag = "h2",
  size = "5xl",
  gradient = "accent",
  align = "left",
  glow = false,
  style,
}: Props) {
  const fontSize = SIZE_MAP[size] || SIZE_MAP["5xl"];
  const cls = gradient === "galactic" ? "esu-gradient-galactic" : "esu-gradient-text";

  return (
    <Tag
      className={cls}
      style={{
        fontSize,
        fontWeight: 900,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        textAlign: align,
        filter: glow ? "drop-shadow(0 0 32px rgba(129,140,248,0.4))" : undefined,
        margin: 0,
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
