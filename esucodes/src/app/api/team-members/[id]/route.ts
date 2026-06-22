import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAllowedFields, requireRole, withAuthErrors } from "@/lib/auth";

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

export const PATCH = withAuthErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await requireRole("admin");
  const rawBody = await req.json();
  const payload = assertAllowedFields<TeamMemberWrite>(rawBody, WRITABLE_FIELDS);

  const supabase = await createClient();
  const { data, error } = await supabase.from("team_members").update(payload).eq("id", params.id).select().single();
  if (error) {
    console.error("team-members PATCH error:", error);
    return NextResponse.json({ error: "Ekip üyesi güncellenemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});

export const DELETE = withAuthErrors(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("team_members").delete().eq("id", params.id);
  if (error) {
    console.error("team-members DELETE error:", error);
    return NextResponse.json({ error: "Ekip üyesi silinemedi." }, { status: 400 });
  }
  return NextResponse.json({ success: true });
});
