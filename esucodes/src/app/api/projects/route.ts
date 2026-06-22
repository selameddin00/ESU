import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAllowedFields, requireRole, withAuthErrors } from "@/lib/auth";

// Bu route şu an yalnızca admin panelinden (ProjectsTab) tüketiliyor; bu yüzden GET dahil
// tüm işlemler admin'e kapatıldı. Halka açık projeler sayfası ayrı bir veri yoluyla
// besleniyor ve bu değişiklik kapsamının dışında.
const WRITABLE_FIELDS = ["name", "tagline", "description", "tech", "status", "github_url", "live_url", "icon", "accent_color", "order_index"] as const;

type ProjectWrite = {
  name: string;
  tagline: string | null;
  description: string | null;
  tech: string[];
  status: string;
  github_url: string | null;
  live_url: string | null;
  icon: string;
  accent_color: string;
  order_index: number;
};

export const GET = withAuthErrors(async () => {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").select("*").order("order_index");
  if (error) {
    console.error("projects GET error:", error);
    return NextResponse.json({ error: "Projeler getirilemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});

export const POST = withAuthErrors(async (req: NextRequest) => {
  await requireRole("admin");
  const rawBody = await req.json();
  const payload = assertAllowedFields<ProjectWrite>(rawBody, WRITABLE_FIELDS);

  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").insert(payload).select().single();
  if (error) {
    console.error("projects POST error:", error);
    return NextResponse.json({ error: "Proje eklenemedi." }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
});
