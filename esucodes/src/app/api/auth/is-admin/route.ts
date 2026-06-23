import { NextResponse } from "next/server";
import { getSessionRole } from "@/lib/auth";

export async function GET() {
  const session = await getSessionRole();
  if (!session) return NextResponse.json({ isAdmin: false, role: null });

  return NextResponse.json({ isAdmin: ["admin", "editor"].includes(session.role), role: session.role });
}
