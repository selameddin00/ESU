import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { requireRole, withAuthErrors } from "@/lib/auth";

export const GET = withAuthErrors(async () => {
  await requireRole("admin");

  // Listeleme, anon client + "Herkes profil okuyabilir" select policy'si ile çalışır —
  // service-role'e gerek yok, RLS zaten izin veriyor.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, role, full_name, username")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("admin/users GET error:", error);
    return NextResponse.json({ error: "Kullanıcılar getirilemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});
