import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { AuthError, assertAllowedFields, requireRole, withAuthErrors } from "@/lib/auth";
import { APPLICATION_STATUSES } from "@/lib/data";
import { sendApplicationStatusEmail } from "@/lib/applicationEmail";

type Status = (typeof APPLICATION_STATUSES)[number];

export const PATCH = withAuthErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
  await requireRole("admin");

  const { status } = assertAllowedFields<{ status: Status }>(await req.json(), ["status"]);
  if (!status || !APPLICATION_STATUSES.includes(status)) {
    throw new AuthError(400, "Geçersiz durum.");
  }

  // RLS "Admin başvuru yönetebilir" (ALL) policy'si gerçek admin oturumuna zaten izin
  // veriyor — service-role gerekmiyor.
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("applications")
    .update({ status })
    .eq("id", params.id)
    .select("name, email")
    .single();

  if (error) {
    console.error("admin/applications PATCH error:", error);
    return NextResponse.json({ error: "Başvuru güncellenemedi." }, { status: 400 });
  }

  // Mail gönderimi yanıtı bloklamaz: sendApplicationStatusEmail kendi içinde
  // her gönderimi try/catch'liyor; mail başarısız olsa da status zaten değişti.
  if (status === "kabul" || status === "red") {
    await sendApplicationStatusEmail(data as { name: string; email: string }, status);
  }

  return NextResponse.json({ success: true });
});
