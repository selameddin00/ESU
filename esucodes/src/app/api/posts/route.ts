import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSessionRole, requireRole, withAuthErrors } from "@/lib/auth";
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["h2","h3","h4","p","ul","ol","li","blockquote","pre","code","strong","em","a","img","hr","br","span"];
const sanitize = (html: string) => DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["href","src","alt","class","target","rel"] });

export const GET = withAuthErrors(async (req: NextRequest) => {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const status   = searchParams.get("status");
  const category = searchParams.get("category");
  const slug     = searchParams.get("slug");

  const session = await getSessionRole();

  if (slug) {
    const { data, error } = await supabase
      .from("posts")
      .select("*, profiles(full_name, username)")
      .eq("slug", slug)
      .single();
    if (error) {
      console.error("posts GET (slug) error:", error);
      return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
    }
    return NextResponse.json(data);
  }

  let query = supabase
    .from("posts")
    .select("id, title, slug, excerpt, category, status, published_at, read_time, cover_image, created_at, profiles(full_name, username)")
    .order("published_at", { ascending: false });

  // Least privilege: public/member sadece yayınlanmışı görür; editor sadece kendi
  // taslağını + kendi yazılarını görür; admin tüm post'ları (tüm yazarlar) görür.
  if (session?.role === "admin") {
    if (status) query = query.eq("status", status) as typeof query;
  } else if (session?.role === "editor") {
    if (status === "published") {
      query = query.eq("status", "published") as typeof query;
    } else if (status) {
      query = query.eq("status", status).eq("author_id", session.id) as typeof query;
    } else {
      query = query.eq("author_id", session.id) as typeof query;
    }
  } else {
    query = query.eq("status", "published") as typeof query;
  }
  if (category) query = query.eq("category", category) as typeof query;

  const { data, error } = await query;
  if (error) {
    console.error("posts GET error:", error);
    return NextResponse.json({ error: "Yazılar getirilemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});

export const POST = withAuthErrors(async (req: NextRequest) => {
  const user = await requireRole(["editor", "admin"]);

  const body = await req.json();
  const { title, slug, excerpt, content, category, status, read_time, cover_image } = body;

  const supabase = await createClient();
  const { data, error } = await supabase.from("posts").insert({
    title, slug, excerpt, content: sanitize(content ?? ""), category,
    author_id:    user.id,
    status:       status ?? "draft",
    published_at: status === "published" ? new Date().toISOString() : null,
    read_time,
    cover_image,
  }).select().single();

  if (error) {
    console.error("posts POST error:", error);
    return NextResponse.json({ error: "Yazı oluşturulamadı." }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
});
