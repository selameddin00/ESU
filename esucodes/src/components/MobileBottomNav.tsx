"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FolderOpen, BookOpen, Users, UserPlus } from "lucide-react";

const NAV = [
  { href: "/",           Icon: Home,       label: "Ana" },
  { href: "/projeler",   Icon: FolderOpen, label: "Projeler" },
  { href: "/blog",       Icon: BookOpen,   label: "Blog" },
  { href: "/murettebat", Icon: Users,      label: "Ekip" },
  { href: "/katil",      Icon: UserPlus,   label: "Katıl" },
];

export function MobileBottomNav() {
  const pathname = usePathname();
  return (
    <nav className="mob-bottom-nav">
      {NAV.map(({ href, Icon, label }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className={`mob-nav-item${active ? " mob-active" : ""}`}>
            <Icon size={22} strokeWidth={active ? 2.5 : 2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
