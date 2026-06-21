import { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Herkese açık sayfalar
      {
        userAgent: "*",
        allow: ["/", "/blog", "/projeler", "/murettebat", "/hakkimizda", "/katil"],
        disallow: ["/admin", "/editor", "/api/", "/giris", "/kayit"],
      },
      // AI tarayıcılarına açıkça izin ver
      { userAgent: "GPTBot",        allow: "/" },
      { userAgent: "Claude-Web",    allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Googlebot",     allow: "/" },
      { userAgent: "anthropic-ai",  allow: "/" },
      { userAgent: "CCBot",         allow: "/" },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
