import "server-only";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { Role } from "@/lib/supabase/types";

export type SessionUser = {
  id: string;
  email: string;
  role: Role;
};

export class AuthError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}

// Tek doğruluk kaynağı: profiles.role. ADMIN_EMAIL burada okunmaz.
export async function getSessionRole(): Promise<SessionUser | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile as { role: Role } | null)?.role ?? "member";
  return { id: user.id, email: user.email ?? "", role };
}

function roleAllowed(role: Role, allowed: Role | Role[]): boolean {
  return Array.isArray(allowed) ? allowed.includes(role) : role === allowed;
}

export async function requireRole(
  allowed: Role | Role[],
  fetchSession: () => Promise<SessionUser | null> = getSessionRole
): Promise<SessionUser> {
  const session = await fetchSession();
  if (!session) throw new AuthError(401, "Giriş gerekli.");
  if (!roleAllowed(session.role, allowed)) throw new AuthError(403, "Yetkisiz.");
  return session;
}

// Kaynağın sahibi olan kullanıcı, rolü ne olursa olsun geçer; sahip değilse `allowed` rolüne bakılır.
export async function requireOwnerOrRole(
  ownerId: string | null,
  allowed: Role | Role[],
  fetchSession: () => Promise<SessionUser | null> = getSessionRole
): Promise<SessionUser> {
  const session = await fetchSession();
  if (!session) throw new AuthError(401, "Giriş gerekli.");
  if (ownerId !== null && session.id === ownerId) return session;
  if (roleAllowed(session.role, allowed)) return session;
  throw new AuthError(403, "Yetkisiz.");
}

// Body'deki her alan `allowed` listesinde olmalı; bilinmeyen alan sessizce atılmaz, 400 ile reddedilir.
export function assertAllowedFields<T extends Record<string, unknown>>(
  body: unknown,
  allowed: readonly (keyof T)[]
): Partial<T> {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new AuthError(400, "Geçersiz istek gövdesi.");
  }
  const allowedSet = new Set(allowed as string[]);
  const result: Partial<T> = {};
  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    if (!allowedSet.has(key)) {
      throw new AuthError(400, `Bilinmeyen alan: ${key}`);
    }
    (result as Record<string, unknown>)[key] = value;
  }
  return result;
}

// Bir admin kendi hesabını admin dışı bir role düşüremez (sistemde admin kalmama riski).
export function assertNotSelfDemotion(actorId: string, targetId: string, newRole: Role): void {
  if (actorId === targetId && newRole !== "admin") {
    throw new AuthError(403, "Kendi admin rolünü kaldıramazsın.");
  }
}

// Tek hata->HTTP eşleme noktası: route gövdeleri yalnızca happy-path yazar, guard'lar throw eder.
export function withAuthErrors<Args extends unknown[]>(
  handler: (req: NextRequest, ...args: Args) => Promise<NextResponse>
): (req: NextRequest, ...args: Args) => Promise<NextResponse> {
  return async (req, ...args) => {
    try {
      return await handler(req, ...args);
    } catch (err) {
      if (err instanceof AuthError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      console.error("Unhandled route error:", err);
      return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
    }
  };
}
