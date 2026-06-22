import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, withAuthErrors } from "@/lib/auth";

export const GET = withAuthErrors(async () => {
  await requireRole("admin");

  // RLS "Admin tüm yorumları görebilir" policy'si gerçek admin oturumuna zaten
  // izin veriyor — service-role gerekmiyor.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comments")
    .select("id, author_name, author_email, content, created_at, is_approved, post_id")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin/comments GET error:", error);
    return NextResponse.json({ error: "Yorumlar getirilemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});
