import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole } from "@/lib/auth";
import { promises as dns } from "dns";

const MX_LOOKUP_TIMEOUT_MS = 2000;

async function emailDomainValid(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    // DNS sorgusu yanıt vermezse istek süresiz beklemesin; zaman aşımında da
    // "geçersiz domain" davranışına düşer (catch ile aynı yol).
    const records = await Promise.race([
      dns.resolveMx(domain),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error("MX lookup timeout")), MX_LOOKUP_TIMEOUT_MS);
      }),
    ]);
    return records.length > 0;
  } catch {
    return false;
  }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// IP bazlı, bellek içi basit rate limit. Tek instance'a özel; serverless'ta her cold
// start'ta sıfırlanır ve birden çok instance arasında paylaşılmaz — dağıtık/garantili
// bir koruma değil, ama dış bağımlılık eklemeden spam/flood'u büyük ölçüde azaltır.
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const rateLimitHits = new Map<string, { count: number; windowStart: number }>();

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitHits.get(ip);
  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitHits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > RATE_LIMIT_MAX;
}

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("post_id");
  if (!postId) return NextResponse.json([], { status: 400 });

  const supabase = await createClient();
  const session = await getSessionRole();

  let query = supabase
    .from("comments")
    .select("id, author_name, content, created_at, is_approved")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  // RLS zaten admin olmayan herkese is_approved=true filtresini uyguluyor
  // (doğrulandı: "Onaylı yorumlar herkese açık" policy'si). Bu satır, o policy
  // yanlışlıkla gevşetilirse/kaldırılırsa diye eklenen yedek (ikincil) savunma.
  if (session?.role !== "admin") {
    query = query.eq("is_approved", true) as typeof query;
  }

  const { data, error } = await query;
  if (error) {
    console.error("comments GET error:", error);
    return NextResponse.json({ error: "Yorumlar getirilemedi." }, { status: 400 });
  }
  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json({ error: "Çok fazla istek. Birazdan tekrar dene." }, { status: 429 });
  }

  const { post_id, author_name, author_email, content } = await request.json();

  if (!post_id || !author_name?.trim() || !author_email?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Tüm alanlar zorunlu." }, { status: 400 });
  }

  const validDomain = await emailDomainValid(author_email.trim());
  if (!validDomain) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi gir." }, { status: 400 });
  }

  // RLS "Herkes yorum yapabilir" policy'si anon insert'e zaten izin veriyor,
  // service-role gerekmiyor (least privilege). with_check artık is_approved=false'u
  // DB seviyesinde zorluyor. NOT: .select() ZİNCİRLEMİYORUZ — eklenen satır onaylanana
  // kadar SELECT politikalarına göre anon'a görünmez, .select() eklenirse insert'in
  // kendisi RETURNING için RLS'e çarpıp 401 döner (bu regresyonu deneyerek bulduk).
  const supabase = await createClient();
  const { error } = await supabase.from("comments").insert({
    post_id,
    author_name:  author_name.trim(),
    author_email: author_email.trim().toLowerCase(),
    content:      content.trim(),
    is_approved:  false,
  });

  if (error) {
    console.error("comments POST error:", error);
    return NextResponse.json({ error: "Yorum kaydedilemedi." }, { status: 500 });
  }

  // Admin'e email bildirimi gönder
  if (process.env.ADMIN_EMAIL && process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: post } = await supabase.from("posts").select("title").eq("id", post_id).single();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";
    const safeAuthorName  = escapeHtml(author_name);
    const safeAuthorEmail = escapeHtml(author_email);
    const safeContent     = escapeHtml(content);
    try {
      await resend.emails.send({
        from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
        to:   [process.env.ADMIN_EMAIL],
        subject: `💬 Yeni yorum: ${(post as { title: string } | null)?.title ?? ""}`,
        html: `
          <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:28px;background:#0f172a;color:#f1f5f9;border-radius:14px;border:1px solid #1e293b;">
            <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
              <span style="font-size:24px">💬</span>
              <h2 style="margin:0;color:#818cf8;font-size:18px">ESUcodes — Yeni Yorum</h2>
            </div>
            <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:80px">Yazı</td><td style="padding:6px 0;color:#cbd5e1;font-size:13px;font-weight:600">${(post as { title: string } | null)?.title ?? "—"}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Yazar</td><td style="padding:6px 0;color:#cbd5e1;font-size:13px">${safeAuthorName}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px">E-posta</td><td style="padding:6px 0;color:#22d3ee;font-size:13px">${safeAuthorEmail}</td></tr>
            </table>
            <div style="background:#1e293b;padding:16px 18px;border-radius:10px;border-left:3px solid #818cf8;margin-bottom:20px;">
              <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.7">${safeContent}</p>
            </div>
            <a href="${siteUrl}/admin" style="display:inline-block;background:#818cf8;color:#0f172a;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px;">Admin Panelinde Görüntüle →</a>
          </div>
        `,
      });
    } catch (e) {
      console.error("Resend error:", e);
    }
  }

  return NextResponse.json({ success: true }, { status: 201 });
}
