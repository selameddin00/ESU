export const NAV = [
  { id: "home",       label: "Anasayfa",    href: "/" },
  { id: "projects",   label: "Projeler",    href: "/projeler" },
  { id: "blog",       label: "Blog",        href: "/blog" },
  { id: "team",       label: "Ekip",        href: "/murettebat" },
  { id: "about",      label: "Hakkımızda",  href: "/hakkimizda" },
  { id: "join",       label: "Katıl",       href: "/katil" },
];

export const TICKER = [
  "🚀  ESUCODES v2.0 yayında",
  "⚡  PANKEK robotu tamamlandı",
  "🔐  Yeni siber güvenlik yazıları geldi",
  "🌌  Yazılım evreni genişliyor",
  "👾  Yeni üye almaya başladık",
  "🛰️  Next.js 14 App Router rehberi yayınlandı",
  "🤖  Kanban projesi geliştirme aşamasında",
];

export const CATEGORIES = ["Tümü", "Cyber Security", "AI", "Frontend", "Embedded", "Research"];

export interface Post {
  id: number;
  slug: string;
  category: string;
  title: string;
  date: string;
  readTime: string;
  author: string;
  excerpt: string;
  body: { type: string; text: string }[];
}

export const POSTS: Post[] = [
  {
    id: 1, slug: "siber-guvenlik-trendleri-2025", category: "Cyber Security",
    title: "Siber Güvenlik Trendleri 2025", date: "2025-01-15", readTime: "5 dk",
    author: "Egemen Korkmaz",
    excerpt: "Zero Trust, AI destekli tehdit tespiti ve bulut güvenliği — 2025'in öne çıkan trendlerini inceliyoruz.",
    body: [
      { type: "p",    text: "2025 yılında siber güvenlik alanında önemli gelişmeler yaşanıyor. Bu yazıda, öne çıkan trendleri inceleyeceğiz." },
      { type: "h2",   text: "Zero Trust Güvenlik Modeli" },
      { type: "p",    text: "Zero Trust, \"hiçbir şeye güvenme, her şeyi doğrula\" prensibine dayanan bir güvenlik modelidir. Ağ içindeki veya dışındaki tüm trafiği şüpheli kabul eder." },
      { type: "code", text: "const authenticate = async (user) => {\n  const token = await generateToken(user);\n  return verifyToken(token);\n};" },
      { type: "h2",   text: "Yapay Zeka Destekli Tehdit Tespiti" },
      { type: "p",    text: "AI teknolojileri, siber saldırıları tespit etmede kritik bir rol oynuyor. Machine learning algoritmaları anormal davranışları tespit ederek erken uyarı sağlıyor." },
    ],
  },
  {
    id: 2, slug: "ai-ve-yazilim-gelistirme", category: "AI",
    title: "Yapay Zeka ve Yazılım Geliştirme", date: "2025-01-08", readTime: "7 dk",
    author: "Egemen Korkmaz",
    excerpt: "Kod yazmaktan test etmeye, AI araçları geliştirici iş akışını nasıl yeniden şekillendiriyor?",
    body: [
      { type: "p",  text: "Yapay zeka, yazılım geliştirme sürecinin her aşamasına sızıyor. Bu yolculuğu birlikte keşfedelim." },
      { type: "h2", text: "Otomatik Kod Üretimi" },
      { type: "p",  text: "LLM tabanlı araçlar, tekrarlayan kod bloklarını saniyeler içinde üretebiliyor. Ancak insan denetimi hâlâ vazgeçilmez." },
    ],
  },
  {
    id: 3, slug: "nextjs-14-app-router-rehberi", category: "Frontend",
    title: "Next.js 14 App Router Rehberi", date: "2024-12-20", readTime: "9 dk",
    author: "Egemen Korkmaz",
    excerpt: "Server Components, layouts ve streaming — App Router ile modern bir mimariye geçiş.",
    body: [
      { type: "p",  text: "App Router, Next.js'in geleceği. Server Components ile veri çekme ve render mantığı kökten değişiyor." },
      { type: "h2", text: "Layouts & Nested Routing" },
      { type: "p",  text: "İç içe layout'lar sayesinde paylaşılan UI parçalarını yeniden render etmeden koruyabilirsiniz." },
    ],
  },
  {
    id: 4, slug: "kuantum-hesaplama", category: "Research",
    title: "Kuantum Hesaplama: Yeni Bir Çağ", date: "2024-12-05", readTime: "6 dk",
    author: "Selameddin Tirit",
    excerpt: "Qubit'ler, süperpozisyon ve dolanıklık — kuantum bilgisayarların temellerine bir bakış.",
    body: [
      { type: "p", text: "Kuantum hesaplama, klasik bilgisayarların çözemediği problemleri çözme vaadiyle geliyor." },
    ],
  },
  {
    id: 5, slug: "arduino-gomulu-sistemler", category: "Embedded",
    title: "Arduino ile Gömülü Sistemler", date: "2024-11-22", readTime: "8 dk",
    author: "Umut Zaif",
    excerpt: "C++ ve Arduino kullanarak ilk gömülü sistem projenizi adım adım nasıl kurarsınız.",
    body: [
      { type: "p", text: "Gömülü sistemler, donanım ve yazılımın buluştuğu büyüleyici bir alandır." },
    ],
  },
  {
    id: 6, slug: "zero-trust-mimarisi", category: "Cyber Security",
    title: "Zero Trust Mimarisi Nedir?", date: "2024-11-10", readTime: "5 dk",
    author: "Egemen Korkmaz",
    excerpt: "Geleneksel çevre güvenliğinden kimlik temelli, sürekli doğrulayan bir modele geçiş.",
    body: [
      { type: "p", text: "Zero Trust, modern güvenlik mimarisinin temel taşı haline geldi." },
    ],
  },
];

export interface Project {
  id: number;
  slug: string;
  name: string;
  tagline: string;
  status: "live" | "completed" | "in-progress" | "experimental";
  tech: string[];
  description: string;
  icon: string;
  accentColor: string;
  links: { github?: string; live?: string };
}

export const PROJECTS: Project[] = [
  {
    id: 1, slug: "esucodes-platform", name: "ESUCODES Platform", tagline: "Yazılım evreninin merkezi",
    status: "live", tech: ["Next.js 14", "TypeScript", "Tailwind CSS", "Framer Motion"],
    description: "ESUcodes'un ana platformu. Blog yazıları, ekip sayfaları ve içerik yönetim sistemi ile yazılım öğrencileri için açık bir bilgi merkezi.",
    icon: "Globe", accentColor: "#818cf8",
    links: { github: "#", live: "#" },
  },
  {
    id: 2, slug: "pankek", name: "PANKEK Robot", tagline: "Otonom robot projesi",
    status: "completed", tech: ["C++", "Arduino", "ROS", "Servo Motors"],
    description: "Arkadaşlarımızla geliştirdiğimiz otonom robot. Engel algılama, çizgi takibi ve manuel kontrol modlarıyla donanmış bir embedded systems projesi.",
    icon: "Bot", accentColor: "#22d3ee",
    links: { github: "#" },
  },
  {
    id: 3, slug: "kanban-board", name: "Kanban Board", tagline: "Takım için proje yönetimi",
    status: "in-progress", tech: ["React", "Node.js", "PostgreSQL", "WebSocket"],
    description: "ESU ekibinin kendi projelerini yönetmek için geliştirdiği Kanban uygulaması. Gerçek zamanlı işbirliği, görev takibi ve sprint planlaması içeriyor.",
    icon: "LayoutDashboard", accentColor: "#a78bfa",
    links: { github: "#" },
  },
  {
    id: 4, slug: "wormhole", name: "Wormhole", tagline: "Gizemli bir şey...",
    status: "experimental", tech: ["???", "🌌", "classified"],
    description: "Ne olduğunu anlamak için keşfetmek lazım. Yazılım evreninin en gizemli köşesi. Belki bir boyut kapısı, belki bir easter egg — kim bilir?",
    icon: "Orbit", accentColor: "#8b5cf6",
    links: {},
  },
];

export interface TeamMember {
  slug: string;
  name: string;
  role: string;
  bio: string;
  skills: string[];
  projects: { name: string; description: string }[];
}

export const TEAM: TeamMember[] = [
  {
    slug: "umut-zaif", name: "Umut Zaif", role: "Co-founder · Embedded Systems",
    bio: "Modern web teknolojileri ve gömülü sistemler uzmanı. PANKEK robotunun baş mimarı.",
    skills: ["C++", "Arduino", "ROS", "IoT", "Takım Çalışması"],
    projects: [
      { name: "PANKEK Robot", description: "Arduino ve C++ ile geliştirilen otonom robot projesi." },
      { name: "IoT Çözümleri", description: "Nesnelerin interneti için gelişmiş çözümler." },
    ],
  },
  {
    slug: "egemen-korkmaz", name: "Egemen Korkmaz", role: "Co-founder · CEO",
    bio: "Bilgisayarla büyüdüm, şimdi onları daha güvenli hale getirmeye çalışıyorum. ESUCODES'un kurucu üyesi.",
    skills: ["Next.js", "TypeScript", "Bilgi Güvenliği", "Frontend Dev.", "Takım Çalışması"],
    projects: [
      { name: "ESUCODES Platform", description: "Şu anda bulunduğunuz site." },
      { name: "PANKEK", description: "Arkadaşlarımızla geliştirdiğimiz robot projesi." },
    ],
  },
  {
    slug: "selameddin-tirit", name: "Selameddin Tirit", role: "Co-founder · Backend",
    bio: "Yüksek performanslı backend sistemleri geliştirir. Kanban board'un mimarı.",
    skills: ["Java", "Spring Boot", "PostgreSQL", "Mikroservis", "Takım Çalışması"],
    projects: [
      { name: "Kanban Board", description: "ESU ekibi için gerçek zamanlı proje yönetim aracı." },
      { name: "Backend Altyapısı", description: "Ölçeklenebilir ve hızlı backend sistemleri." },
    ],
  },
];

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
