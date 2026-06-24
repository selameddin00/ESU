import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, withAuthErrors } from "@/lib/auth";

export const GET = withAuthErrors(async () => {
  await requireRole("admin");

  // RLS "Admin başvuruları görebilir" policy'si gerçek admin oturumuna zaten izin
  // veriyor — service-role gerekmiyor.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .select("id, name, email, github, roles, level, message, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin/applications GET error:", error);
    return NextResponse.json({ error: "Başvurular getirilemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});
