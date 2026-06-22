import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";
import { AuthError, assertAllowedFields, assertNotSelfDemotion, requireRole, withAuthErrors } from "@/lib/auth";
import type { Role } from "@/lib/supabase/types";

const VALID_ROLES: readonly Role[] = ["member", "editor", "admin"];

export const PATCH = withAuthErrors(async (req: NextRequest, { params }: { params: { id: string } }) => {
  // 1) Guard önce: çağıran kesin admin değilse burada 401/403 ile durur.
  const actor = await requireRole("admin");

  // 2) Body'yi tek alana ("role") sıkı whitelist'le, değeri de geçerli rol kümesine zorla.
  const { role } = assertAllowedFields<{ role: Role }>(await req.json(), ["role"]);
  if (!role || !VALID_ROLES.includes(role)) {
    throw new AuthError(400, "Geçersiz rol.");
  }

  // 3) Self-demotion kuralı: admin kendi rolünü admin dışına düşüremez.
  assertNotSelfDemotion(actor.id, params.id, role);

  // 4) Service-role client SADECE bu satıra, SADECE bu güncelleme için kullanılır.
  //    Anon client burada işe yaramaz: RLS "Kullanıcı kendi profilini güncelleyebilir"
  //    policy'si auth.uid()=id şartı taşıyor, yani admin başkasının rolünü anon client
  //    ile değiştiremez. Guard (1) ve (3) zaten "evet" dediği için bu noktaya kadar
  //    gelinmiş olması, service-role kullanımını bu tek operasyona daraltıyor — bu route
  //    dışında, ya da bu satırdan önce service-role client hiç oluşturulmuyor.
  const admin = await createAdminClient();
  const { data, error } = await admin
    .from("profiles")
    .update({ role })
    .eq("id", params.id)
    .select("id, role, full_name, username")
    .single();

  if (error) {
    console.error("admin/users PATCH error:", error);
    return NextResponse.json({ error: "Rol güncellenemedi." }, { status: 400 });
  }
  return NextResponse.json(data);
});
