import { describe, expect, it, vi } from "vitest";

// lib/auth.ts, next/headers'a dokunan @/lib/supabase/server'ı import ediyor.
// Testler getSessionRole'ün IO'sunu değil, guard'ların karar mantığını hedefliyor;
// bu yüzden gerçek next/headers'ın hiç çalışmaması için modülü mock'luyoruz.
vi.mock("server-only", () => ({}));
vi.mock("@/lib/supabase/server", () => ({
  createClient: vi.fn(),
  createAdminClient: vi.fn(),
}));

import {
  AuthError,
  assertAllowedFields,
  assertNotSelfDemotion,
  requireOwnerOrRole,
  requireRole,
  withAuthErrors,
  type SessionUser,
} from "@/lib/auth";
import { NextResponse, type NextRequest } from "next/server";

const member: SessionUser = { id: "u1", email: "m@x.com", role: "member" };
const editor: SessionUser = { id: "u2", email: "e@x.com", role: "editor" };
const admin: SessionUser = { id: "u3", email: "a@x.com", role: "admin" };

describe("requireRole", () => {
  it("oturum yoksa 401 throw eder", async () => {
    await expect(requireRole("admin", async () => null)).rejects.toMatchObject({ status: 401 });
  });

  it("rol listede yoksa 403 throw eder", async () => {
    await expect(requireRole("admin", async () => member)).rejects.toMatchObject({ status: 403 });
  });

  it("rol tek değer olarak eşleşirse session'ı döner", async () => {
    await expect(requireRole("admin", async () => admin)).resolves.toEqual(admin);
  });

  it("rol allow-list içindeyse session'ı döner", async () => {
    await expect(requireRole(["editor", "admin"], async () => editor)).resolves.toEqual(editor);
  });
});

describe("requireOwnerOrRole", () => {
  it("oturum yoksa 401 throw eder", async () => {
    await expect(requireOwnerOrRole("u1", "admin", async () => null)).rejects.toMatchObject({ status: 401 });
  });

  it("sahip ise rolden bağımsız geçer", async () => {
    await expect(requireOwnerOrRole("u1", "admin", async () => member)).resolves.toEqual(member);
  });

  it("sahip değilse ama rol yeterliyse geçer", async () => {
    await expect(requireOwnerOrRole("someone-else", "admin", async () => admin)).resolves.toEqual(admin);
  });

  it("sahip değilse ve rol yetersizse 403 throw eder", async () => {
    await expect(requireOwnerOrRole("someone-else", "admin", async () => editor)).rejects.toMatchObject({ status: 403 });
  });
});

describe("assertAllowedFields", () => {
  const allowed = ["title", "status"] as const;

  it("yalnızca izinli alanları döner", () => {
    expect(assertAllowedFields({ title: "x", status: "draft" }, allowed)).toEqual({ title: "x", status: "draft" });
  });

  it("bilinmeyen alan varsa 400 throw eder (sessizce atmaz)", () => {
    expect(() => assertAllowedFields({ title: "x", author_id: "evil" }, allowed)).toThrowError(
      expect.objectContaining({ status: 400 })
    );
  });

  it("body obje değilse 400 throw eder", () => {
    expect(() => assertAllowedFields(null, allowed)).toThrowError(expect.objectContaining({ status: 400 }));
    expect(() => assertAllowedFields(["x"], allowed)).toThrowError(expect.objectContaining({ status: 400 }));
  });
});

describe("assertNotSelfDemotion", () => {
  it("admin kendi rolünü admin dışına düşürürse throw eder", () => {
    expect(() => assertNotSelfDemotion("u3", "u3", "editor")).toThrowError(
      expect.objectContaining({ status: 403 })
    );
  });

  it("admin kendini admin olarak günceller (no-op) ise throw etmez", () => {
    expect(() => assertNotSelfDemotion("u3", "u3", "admin")).not.toThrow();
  });

  it("başka bir kullanıcının rolü değiştiriliyorsa throw etmez", () => {
    expect(() => assertNotSelfDemotion("u3", "u1", "member")).not.toThrow();
  });
});

describe("withAuthErrors", () => {
  it("AuthError'ı status+message ile HTTP yanıtına çevirir", async () => {
    const handler = vi.fn(async () => {
      throw new AuthError(403, "Yetkisiz.");
    });
    const wrapped = withAuthErrors(handler);
    const res = await wrapped({} as NextRequest);
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Yetkisiz." });
  });

  it("beklenmeyen hatayı 500 + generik mesaja çevirir (detay sızdırmaz)", async () => {
    const handler = vi.fn(async () => {
      throw new Error("kolon adı: posts.secret_internal_column yok");
    });
    const wrapped = withAuthErrors(handler);
    const res = await wrapped({} as NextRequest);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.error).toBe("Sunucu hatası.");
    expect(JSON.stringify(body)).not.toContain("secret_internal_column");
  });

  it("başarılı yanıtı olduğu gibi geçirir", async () => {
    const handler = vi.fn(async () => NextResponse.json({ ok: true }));
    const wrapped = withAuthErrors(handler);
    const res = await wrapped({} as NextRequest);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
  });
});
