import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["h2","h3","h4","p","ul","ol","li","blockquote","pre","code","strong","em","a","img","hr","br","span"];
const sanitize = (html: string) => DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["href","src","alt","class","target","rel"] });

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const body = await req.json();

  if (body.status === "published") {
    const { data: existing } = await supabase.from("posts").select("published_at").eq("id", id).single();
    const post = existing as { published_at: string | null } | null;
    if (!post?.published_at) body.published_at = new Date().toISOString();
  }

  if (body.content) body.content = sanitize(body.content);
  const { data, error } = await supabase.from("posts").update(body).eq("id", id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const isEnvAdmin = process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL;
  if (!isEnvAdmin) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    const role = (profile as { role: string } | null)?.role;
    if (role !== "admin") return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ success: true });
}
