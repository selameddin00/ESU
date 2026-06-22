import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAllowedFields, requireOwnerOrRole, requireRole, withAuthErrors } from "@/lib/auth";
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = ["h2","h3","h4","p","ul","ol","li","blockquote","pre","code","strong","em","a","img","hr","br","span"];
const sanitize = (html: string) => DOMPurify.sanitize(html, { ALLOWED_TAGS, ALLOWED_ATTR: ["href","src","alt","class","target","rel"] });

const PATCHABLE_FIELDS = ["title", "slug", "excerpt", "content", "category", "status", "read_time", "cover_image"] as const;

type PostPatch = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: string;
  read_time: string;
  cover_image: string;
};

export const PATCH = withAuthErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  const supabase = await createClient();

  const { data: existing, error: fetchError } = await supabase
    .from("posts")
    .select("author_id, published_at")
    .eq("id", id)
    .single();
  if (fetchError || !existing) {
    return NextResponse.json({ error: "Yazı bulunamadı." }, { status: 404 });
  }
  const post = existing as { author_id: string | null; published_at: string | null };

  await requireOwnerOrRole(post.author_id, "admin");

  const rawBody = await req.json();
  const patch = assertAllowedFields<PostPatch>(rawBody, PATCHABLE_FIELDS) as Record<string, unknown>;

  if (patch.status === "published" && !post.published_at) {
    patch.published_at = new Date().toISOString();
  }
  if (typeof patch.content === "string") {
    patch.content = sanitize(patch.content);
  }

  const { data, error } = await supabase.from("posts").update(patch).eq("id", id).select().single();
  if (error) {
    console.error("posts PATCH error:", error);
    return NextResponse.json({ error: "Yazı güncellenemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});

export const DELETE = withAuthErrors(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  const { id } = params;
  await requireRole("admin");

  const supabase = await createClient();
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) {
    console.error("posts DELETE error:", error);
    return NextResponse.json({ error: "Yazı silinemedi." }, { status: 400 });
  }
  return NextResponse.json({ success: true });
});
