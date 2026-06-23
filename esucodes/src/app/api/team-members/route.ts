import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAllowedFields, requireRole, withAuthErrors } from "@/lib/auth";

// Bu route şu an yalnızca admin panelinden (TeamTab) tüketiliyor; bu yüzden GET dahil
// tüm işlemler admin'e kapatıldı. Halka açık ekip sayfası ayrı bir veri yoluyla (RLS
// select policy) besleniyor ve bu değişiklik kapsamının dışında.
const WRITABLE_FIELDS = ["name", "role_title", "bio", "skills", "github_url", "linkedin_url", "order_index"] as const;

type TeamMemberWrite = {
  name: string;
  role_title: string;
  bio: string | null;
  skills: string[];
  github_url: string | null;
  linkedin_url: string | null;
  order_index: number;
};

export const GET = withAuthErrors(async () => {
  await requireRole("admin");
  const supabase = await createClient();
  const { data, error } = await supabase.from("team_members").select("*").order("order_index");
  if (error) {
    console.error("team-members GET error:", error);
    return NextResponse.json({ error: "Ekip üyeleri getirilemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});

export const POST = withAuthErrors(async (req: NextRequest) => {
  await requireRole("admin");
  const rawBody = await req.json();
  const payload = assertAllowedFields<TeamMemberWrite>(rawBody, WRITABLE_FIELDS);

  const supabase = await createClient();
  const { data, error } = await supabase.from("team_members").insert(payload).select().single();
  if (error) {
    console.error("team-members POST error:", error);
    return NextResponse.json({ error: "Ekip üyesi eklenemedi." }, { status: 400 });
  }
  return NextResponse.json(data, { status: 201 });
});
