export const NAV = [
  { id: "home",       label: "Anasayfa",    href: "/" },
  { id: "projects",   label: "Projeler",    href: "/projeler" },
  { id: "blog",       label: "Blog",        href: "/blog" },
  { id: "team",       label: "Ekip",        href: "/murettebat" },
  { id: "about",      label: "Hakkımızda",  href: "/hakkimizda" },
  { id: "join",       label: "Katıl",       href: "/katil" },
];

export const CATEGORIES = ["Tümü", "Cyber Security", "AI", "Frontend", "Embedded", "Research"];

export const VALUES = [
  { icon: "Rocket",   title: "Merak",              color: "#818cf8", text: "Yeni teknolojileri ve yazılım evreninin karanlık bölgelerini keşfetmek bizim yakıtımız." },
  { icon: "Eye",      title: "Şeffaflık",           color: "#a78bfa", text: "Yaptığımız hataları, denediğimiz yolları açıkça paylaşırız. Samimiyet gelişimin ilk şartıdır." },
  { icon: "Share2",   title: "Bilgi Paylaşımı",     color: "#22d3ee", text: "ESUcodes bilgiyi saklamaz, yayar. Bildiğimizi anlatır, öğrendiğimizi aktarırız." },
  { icon: "Compass",  title: "Keşif Odaklı Kültür", color: "#34d399", text: "Backend'den embedded'a, siber güvenliğe kadar her dalı merak eder; sınır koymayız." },
  { icon: "Users",    title: "Topluluk Ruhu",        color: "#fb923c", text: "Bugün küçük bir ekibiz; yarın genç yazılımcıların buluştuğu büyük bir galaksi olmayı hedefliyoruz." },
];

export const JOIN_ROLES = [
  { id: "frontend",  label: "Frontend Developer",  icon: "Monitor",      color: "#818cf8" },
  { id: "backend",   label: "Backend Developer",   icon: "Server",       color: "#a78bfa" },
  { id: "security",  label: "Siber Güvenlik",      icon: "Shield",       color: "#22d3ee" },
  { id: "embedded",  label: "Embedded / Donanım",  icon: "Cpu",          color: "#34d399" },
  { id: "content",   label: "İçerik / Yazarlık",   icon: "PenLine",      color: "#fb923c" },
  { id: "research",  label: "Araştırma",           icon: "FlaskConical", color: "#c084fc" },
];

// Katıl formu + /api/applications validasyonu aynı listeyi kullanır (drift olmasın diye).
export const LEVELS = ["Öğrenci", "Junior", "Mid-level", "Senior", "Hobbyist"] as const;

export const APPLICATION_STATUSES = ["yeni", "kabul", "red"] as const;

export const CAT_COLORS: Record<string, { hex: string; tone: string }> = {
  "Cyber Security": { hex: "#22d3ee", tone: "cyan" },
  "AI":             { hex: "#818cf8", tone: "indigo" },
  "Frontend":       { hex: "#a78bfa", tone: "violet" },
  "Embedded":       { hex: "#fb923c", tone: "orange" },
  "Research":       { hex: "#818cf8", tone: "indigo" },
};

export const STATUS_MAP: Record<string, { label: string; color: string }> = {
  live:          { label: "Canlı",           color: "#22d3ee" },
  completed:     { label: "Tamamlandı",      color: "#818cf8" },
  "in-progress": { label: "Geliştiriliyor",  color: "#a78bfa" },
  experimental:  { label: "Deneysel",        color: "#8b5cf6" },
};
