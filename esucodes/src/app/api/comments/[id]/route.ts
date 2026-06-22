import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { assertAllowedFields, requireRole, withAuthErrors } from "@/lib/auth";

export const PATCH = withAuthErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await requireRole("admin");
  const { is_approved } = assertAllowedFields<{ is_approved: boolean }>(await req.json(), ["is_approved"]);

  // RLS "Admin yorum yönetebilir" (ALL) policy'si gerçek admin oturumuna zaten izin
  // veriyor — service-role gerekmiyor, RLS burada gerçek bir ikincil savunma sağlıyor.
  const supabase = await createClient();
  const { error } = await supabase.from("comments").update({ is_approved }).eq("id", params.id);
  if (error) {
    console.error("comments PATCH error:", error);
    return NextResponse.json({ error: "Yorum güncellenemedi." }, { status: 400 });
  }
  return NextResponse.json({ success: true });
});

export const DELETE = withAuthErrors(async (_req: NextRequest, { params }: { params: { id: string } }) => {
  await requireRole("admin");

  const supabase = await createClient();
  const { error } = await supabase.from("comments").delete().eq("id", params.id);
  if (error) {
    console.error("comments DELETE error:", error);
    return NextResponse.json({ error: "Yorum silinemedi." }, { status: 400 });
  }
  return NextResponse.json({ success: true });
});
