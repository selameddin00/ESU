import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ isAdmin: false, role: null });

  if (process.env.ADMIN_EMAIL && user.email === process.env.ADMIN_EMAIL) {
    return NextResponse.json({ isAdmin: true, role: "admin" });
  }

  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  const role = (data as { role: string } | null)?.role ?? "member";
  return NextResponse.json({ isAdmin: ["admin", "editor"].includes(role), role });
}
