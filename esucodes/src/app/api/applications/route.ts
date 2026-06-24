import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { JOIN_ROLES, LEVELS } from "@/lib/data";
import { sendNewApplicationEmails } from "@/lib/applicationEmail";

const ROLE_IDS = JOIN_ROLES.map((r) => r.id);

const ApplicationSchema = z.object({
  name: z.string().trim().min(2, "İsim en az 2 karakter olmalı.").max(100),
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi gir.").max(255),
  github: z.string().trim().max(100).optional().or(z.literal("")),
  roles: z.array(z.string()).min(1, "En az bir alan seç.")
    .refine((arr) => arr.every((id) => ROLE_IDS.includes(id)), "Geçersiz alan seçimi."),
  level: z.enum(LEVELS, { message: "Geçersiz deneyim seviyesi." }),
  message: z.string().trim().min(10, "Mesaj en az 10 karakter olmalı.").max(2000),
});

// IP bazlı, bellek içi basit rate limit (comments route'undaki ile aynı desen).
// Tek instance'a özel; serverless'ta her cold start'ta sıfırlanır ve birden çok
// instance arasında paylaşılmaz — dağıtık/garantili bir koruma değil, ama dış
// bağımlılık eklemeden spam/flood'u büyük ölçüde azaltır.
const RATE_LIMIT_WINDOW_MS = 30 * 60 * 1000;
const RATE_LIMIT_MAX = 3;
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

export async function POST(request: NextRequest) {
  if (isRateLimited(getClientIp(request))) {
    return NextResponse.json({ error: "Çok fazla istek. Birazdan tekrar dene." }, { status: 429 });
  }

  const body = await request.json().catch(() => null);
  const parsed = ApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz form." }, { status: 400 });
  }
  const { name, email, github, roles, level, message } = parsed.data;

  // RLS "Herkes başvurabilir" policy'si anon insert'e zaten izin veriyor (with_check
  // status='yeni' şartıyla), service-role gerekmiyor (least privilege).
  const supabase = await createClient();
  const { error } = await supabase.from("applications").insert({
    name,
    email,
    github: github || null,
    roles,
    level,
    message,
    status: "yeni",
  });

  if (error) {
    console.error("applications POST error:", error);
    return NextResponse.json({ error: "Başvuru kaydedilemedi." }, { status: 500 });
  }

  // Mail gönderimi başvuru kaydını bloklamaz: sendNewApplicationEmails kendi içinde
  // her gönderimi try/catch'liyor, burada da response email sonucundan bağımsız döner.
  await sendNewApplicationEmails({ name, email, github: github || null, roles, level, message });

  return NextResponse.json({ success: true }, { status: 201 });
}
