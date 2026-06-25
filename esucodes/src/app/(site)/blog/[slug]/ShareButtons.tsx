"use client";
import { useEffect, useRef, useState } from "react";
import { Share2, Copy, Check } from "lucide-react";

type Props = { slug: string; title: string };

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";

function XIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" {...props}>
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
    </svg>
  );
}

function LinkedInIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 1 1 0-4.123 2.062 2.062 0 0 1 0 4.123ZM7.119 20.452H3.554V9h3.565v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  );
}

function WhatsAppIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" {...props}>
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.555 4.119 1.523 5.851L0 24l6.305-1.654A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0Zm0 21.785c-1.836 0-3.583-.508-5.114-1.464l-.367-.225-3.741.981.999-3.648-.24-.375A9.74 9.74 0 0 1 2.215 12c0-5.39 4.395-9.785 9.785-9.785S21.785 6.61 21.785 12 17.39 21.785 12 21.785Zm5.472-7.403c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.149-.149.347-.347.521-.521.173-.173.231-.297.347-.495.116-.198.058-.347-.041-.495-.099-.149-.594-1.43-.815-1.929-.198-.495-.413-.452-.594-.461-.173-.008-.371-.01-.57-.01-.198 0-.51.074-.78.372-.27.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.045 3.12 4.952 4.252 2.906 1.132 2.906.755 3.43.71.524-.045 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347Z" />
    </svg>
  );
}

function TelegramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" width={17} height={17} fill="currentColor" {...props}>
      <path d="M12 0a12 12 0 1 0 0 24 12 12 0 0 0 0-24Zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.022c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.538-.196 1.006.128.832.941Z" />
    </svg>
  );
}

export function ShareButtons({ slug, title }: Props) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const [hover, setHover]   = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const url = `${BASE_URL}/blog/${slug}`;

  const socials = [
    { id: "x",        label: "X (Twitter)", Icon: XIcon,        color: "#1d9bf0", href: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
    { id: "linkedin", label: "LinkedIn",    Icon: LinkedInIcon, color: "#0a66c2", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { id: "whatsapp", label: "WhatsApp",    Icon: WhatsAppIcon, color: "#25d366", href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { id: "telegram", label: "Telegram",    Icon: TelegramIcon, color: "#26a5e4", href: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
  ];

  useEffect(() => {
    if (!open) return;
    const onClickOutside = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard API erişilemezse (izin reddi, http context vs.) sessizce yut —
      // kullanıcı input'tan elle seçip kopyalayabilir.
    }
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        style={{
          width: 34, height: 34, borderRadius: 9999, cursor: "pointer",
          border: `1px solid ${hover || open ? "var(--accent-primary)" : "var(--border-subtle)"}`,
          background: hover || open ? "rgba(129,140,248,0.12)" : "var(--glass-fill)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: hover || open ? "var(--accent-primary)" : "var(--text-muted)",
          transition: "all 0.2s",
        }}
      >
        <Share2 size={16} />
      </button>

      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 12px)", right: 0, zIndex: 200,
          width: "min(300px, calc(100vw - 48px))",
          padding: 16, borderRadius: 16,
          background: "var(--bg-secondary)", border: "1px solid var(--border-subtle)",
          boxShadow: "0 16px 48px rgba(0,0,0,0.45)",
        }}>
          <div style={{
            position: "absolute", top: -7, right: 12, width: 13, height: 13,
            background: "var(--bg-secondary)",
            borderLeft: "1px solid var(--border-subtle)", borderTop: "1px solid var(--border-subtle)",
            transform: "rotate(45deg)",
          }} />

          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: copied ? 8 : 16 }}>
            <input
              readOnly
              value={url}
              onFocus={(e) => e.target.select()}
              style={{
                flex: 1, minWidth: 0, padding: "9px 12px", borderRadius: 10,
                background: "var(--bg-tertiary)", border: "1px solid var(--border-subtle)",
                color: "var(--text-secondary)", fontSize: 13, fontFamily: "var(--font-mono)",
                outline: "none",
              }}
            />
            <button
              onClick={handleCopy} title="Kopyala"
              style={{
                flexShrink: 0, width: 36, height: 36, borderRadius: 10, cursor: "pointer",
                border: `1px solid ${copied ? "rgba(34,211,238,0.5)" : "var(--border-subtle)"}`,
                background: copied ? "rgba(34,211,238,0.12)" : "var(--glass-fill)",
                color: copied ? "var(--accent-tertiary)" : "var(--text-secondary)",
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.2s",
              }}
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </button>
          </div>

          {copied && (
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-tertiary)", marginBottom: 16 }}>
              Kopyalandı!
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
            {socials.map(({ id, label, Icon, color, href }) => (
              <SocialBubble key={id} label={label} Icon={Icon} color={color} href={href} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function SocialBubble({ label, Icon, color, href }: { label: string; Icon: React.ElementType; color: string; href: string }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={label}
      aria-label={label}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: 40, height: 40, borderRadius: 9999, flexShrink: 0,
        display: "flex", alignItems: "center", justifyContent: "center",
        background: hover ? color : `${color}18`,
        border: `1px solid ${hover ? color : `${color}40`}`,
        color: hover ? "#fff" : color,
        transition: "all 0.22s ease",
        transform: hover ? "translateY(-3px)" : "none",
      }}
    >
      <Icon />
    </a>
  );
}
