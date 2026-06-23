import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAllowedFields, requireRole, withAuthErrors } from "@/lib/auth";

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

export const PATCH = withAuthErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await requireRole("admin");
  const rawBody = await req.json();
  const payload = assertAllowedFields<ProjectWrite>(rawBody, WRITABLE_FIELDS);

  const supabase = await createClient();
  const { data, error } = await supabase.from("projects").update(payload).eq("id", params.id).select().single();
  if (error) {
    console.error("projects PATCH error:", error);
    return NextResponse.json({ error: "Proje güncellenemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});

export const DELETE = withAuthErrors(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  await requireRole("admin");
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", params.id);
  if (error) {
    console.error("projects DELETE error:", error);
    return NextResponse.json({ error: "Proje silinemedi." }, { status: 400 });
  }
  return NextResponse.json({ success: true });
});
