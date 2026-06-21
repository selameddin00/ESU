import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";
import { promises as dns } from "dns";

async function emailDomainValid(email: string): Promise<boolean> {
  const domain = email.split("@")[1];
  if (!domain) return false;
  try {
    const records = await dns.resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("post_id");
  if (!postId) return NextResponse.json([], { status: 400 });

  const supabase = await createClient();
  // RLS otomatik filtreler: public = sadece onaylı, admin = tümü
  const { data } = await supabase
    .from("comments")
    .select("id, author_name, content, created_at, is_approved")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });

  return NextResponse.json(data ?? []);
}

export async function POST(request: NextRequest) {
  const { post_id, author_name, author_email, content } = await request.json();

  if (!post_id || !author_name?.trim() || !author_email?.trim() || !content?.trim()) {
    return NextResponse.json({ error: "Tüm alanlar zorunlu." }, { status: 400 });
  }

  const validDomain = await emailDomainValid(author_email.trim());
  if (!validDomain) {
    return NextResponse.json({ error: "Geçerli bir e-posta adresi gir." }, { status: 400 });
  }

  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("comments")
    .insert({
      post_id,
      author_name:  author_name.trim(),
      author_email: author_email.trim().toLowerCase(),
      content:      content.trim(),
      is_approved:  false,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Admin'e email bildirimi gönder
  if (process.env.ADMIN_EMAIL && process.env.RESEND_API_KEY) {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { data: post } = await admin.from("posts").select("title").eq("id", post_id).single();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";
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
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Yazar</td><td style="padding:6px 0;color:#cbd5e1;font-size:13px">${author_name}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;font-size:13px">E-posta</td><td style="padding:6px 0;color:#22d3ee;font-size:13px">${author_email}</td></tr>
            </table>
            <div style="background:#1e293b;padding:16px 18px;border-radius:10px;border-left:3px solid #818cf8;margin-bottom:20px;">
              <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.7">${content}</p>
            </div>
            <a href="${siteUrl}/admin" style="display:inline-block;background:#818cf8;color:#0f172a;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px;">Admin Panelinde Görüntüle →</a>
          </div>
        `,
      });
    } catch (e) {
      console.error("Resend error:", e);
    }
  }

  return NextResponse.json({ id: (data as { id: string } | null)?.id }, { status: 201 });
}
