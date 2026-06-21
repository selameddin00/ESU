import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["h2","h3","h4","p","ul","ol","li","blockquote","pre","code","strong","em","a","img","hr","br","span"];
const sanitize = (html: string) => DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["href","src","alt","class","target","rel"] });

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status");
  const category = searchParams.get("category");
  const slug     = searchParams.get("slug");

  const { data: { user } } = await supabase.auth.getUser();
  let role = "public";
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
    role = (profile as { role: string } | null)?.role ?? "member";
  }

  if (slug) {
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(full_name, username)")
      .eq("slug", slug)
      .single();
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json(data);
  }

  let query = supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, status, published_at, read_time, cover_image, created_at, profiles(full_name, username)")
    .order("published_at", { ascending: false });

  if (role === "public" || role === "member") {
    query = query.eq("status", "published") as typeof query;
  } else if (status) {
    query = query.eq("status", status) as typeof query;
  }
  if (category) query = query.eq("category", category) as typeof query;

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (profile as { role: string } | null)?.role;
  if (!role || !["editor", "admin"].includes(role)) {
    return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  }

  const body = await req.json();
  const { title, slug, excerpt, content, category, status, read_time, cover_image } = body;

  const { data, error } = await supabase.from("posts").insert({
    title, slug, excerpt, content: sanitize(content ?? ""), category,
    author_id:    user.id,
    status:       status ?? "draft",
    published_at: status === "published" ? new Date().toISOString() : null,
    read_time,
    cover_image,
  }).select().single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json(data, { status: 201 });
}
