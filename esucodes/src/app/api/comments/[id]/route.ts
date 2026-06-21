import { NextRequest, NextResponse } from "next/server";
import { createClient, createAdminClient } from "@/lib/supabase/server";

async function checkAdmin(): Promise<boolean> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) return true;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return (data as { role: string } | null)?.role === "admin";
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = params;
  const { is_approved } = await request.json();
  const admin = await createAdminClient();
  const { error } = await admin.from("comments").update({ is_approved }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  if (!(await checkAdmin())) return NextResponse.json({ error: "Yetkisiz" }, { status: 403 });
  const { id } = params;
  const admin = await createAdminClient();
  const { error } = await admin.from("comments").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
