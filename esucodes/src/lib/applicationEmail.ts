import "server-only";
import { escapeHtml } from "@/lib/escapeHtml";
import { JOIN_ROLES } from "@/lib/data";

export type ApplicationRecord = {
  name: string;
  email: string;
  github: string | null;
  roles: string[];
  level: string;
  message: string;
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://esucodes.com";

function roleLabels(roles: string[]): string {
  return roles.map((id) => JOIN_ROLES.find((r) => r.id === id)?.label ?? id).join(", ");
}

function wrapper(title: string, icon: string, body: string): string {
  return `
    <div style="font-family:sans-serif;max-width:580px;margin:0 auto;padding:28px;background:#0f172a;color:#f1f5f9;border-radius:14px;border:1px solid #1e293b;">
      <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px;">
        <span style="font-size:24px">${icon}</span>
        <h2 style="margin:0;color:#818cf8;font-size:18px">${title}</h2>
      </div>
      ${body}
    </div>
  `;
}

// Resend test modunda (onboarding@resend.dev) gönderim hesap sahibi dışındaki adreslere
// ulaşmayabilir — bu beklenen bir kısıt, kod RESEND_FROM/ADMIN_EMAIL env'lerinden okuduğu
// için domain doğrulanınca ek değişiklik gerekmeden çalışır.
async function send(to: string, subject: string, html: string): Promise<void> {
  if (!process.env.RESEND_API_KEY) return;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.RESEND_FROM ?? "onboarding@resend.dev",
      to: [to],
      subject,
      html,
    });
  } catch (e) {
    console.error("applicationEmail send error:", e);
  }
}

// Yeni başvuru DB'ye kaydedildikten sonra çağrılır: admin'e bildirim + başvurana onay maili.
// Her gönderim kendi try/catch'i içinde (send() üzerinden) — biri başarısız olsa da
// diğeri ve başvuru akışı durmaz.
export async function sendNewApplicationEmails(app: ApplicationRecord): Promise<void> {
  const safeName  = escapeHtml(app.name);
  const safeEmail = escapeHtml(app.email);
  const safeGithub = app.github ? escapeHtml(app.github) : null;
  const safeLevel = escapeHtml(app.level);
  const safeRoles = escapeHtml(roleLabels(app.roles));
  const safeMessage = escapeHtml(app.message);

  if (process.env.ADMIN_EMAIL) {
    await send(
      process.env.ADMIN_EMAIL,
      `🚀 Yeni başvuru: ${app.name}`,
      wrapper("ESUcodes — Yeni Başvuru", "🚀", `
        <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:90px">İsim</td><td style="padding:6px 0;color:#cbd5e1;font-size:13px;font-weight:600">${safeName}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">E-posta</td><td style="padding:6px 0;color:#22d3ee;font-size:13px">${safeEmail}</td></tr>
          ${safeGithub ? `<tr><td style="padding:6px 0;color:#64748b;font-size:13px">GitHub</td><td style="padding:6px 0;color:#cbd5e1;font-size:13px">@${safeGithub}</td></tr>` : ""}
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Seviye</td><td style="padding:6px 0;color:#cbd5e1;font-size:13px">${safeLevel}</td></tr>
          <tr><td style="padding:6px 0;color:#64748b;font-size:13px">Alanlar</td><td style="padding:6px 0;color:#cbd5e1;font-size:13px">${safeRoles}</td></tr>
        </table>
        <div style="background:#1e293b;padding:16px 18px;border-radius:10px;border-left:3px solid #818cf8;margin-bottom:20px;">
          <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.7">${safeMessage}</p>
        </div>
        <a href="${SITE_URL}/admin" style="display:inline-block;background:#818cf8;color:#0f172a;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px;">Admin Panelinde Görüntüle →</a>
      `)
    );
  }

  await send(
    app.email,
    "Başvurun alındı — ESUcodes",
    wrapper("Başvurun Alındı!", "🛰️", `
      <p style="margin:0 0 16px;color:#cbd5e1;font-size:14px;line-height:1.7">
        Merhaba <strong style="color:#f1f5f9">${safeName}</strong>, ESUcodes'a katılma başvurunu aldık.
        Ekibimiz başvurunu inceleyip en kısa sürede sana geri dönecek.
      </p>
      <p style="margin:0;color:#64748b;font-size:13px;line-height:1.6">Galaksiyi beraber keşfedelim. 🚀</p>
    `)
  );
}

// Admin panelde status 'kabul' veya 'red' olarak değiştirildiğinde çağrılır.
export async function sendApplicationStatusEmail(
  app: Pick<ApplicationRecord, "name" | "email">,
  status: "kabul" | "red"
): Promise<void> {
  const safeName = escapeHtml(app.name);

  if (status === "kabul") {
    await send(
      app.email,
      "Tebrikler, ekibe katıldın! — ESUcodes",
      wrapper("Kabul Edildin!", "🎉", `
        <p style="margin:0 0 16px;color:#cbd5e1;font-size:14px;line-height:1.7">
          Merhaba <strong style="color:#f1f5f9">${safeName}</strong>, başvurunu değerlendirdik ve
          seni ESUcodes ekibine katılmaya davet ediyoruz. Aramızda görmek için sabırsızlanıyoruz!
        </p>
        <a href="${SITE_URL}/giris" style="display:inline-block;background:#22d3ee;color:#0f172a;padding:11px 22px;border-radius:9px;text-decoration:none;font-weight:700;font-size:14px;">Giriş Yap →</a>
      `)
    );
  } else {
    await send(
      app.email,
      "Başvurun hakkında — ESUcodes",
      wrapper("Başvurun Hakkında", "🌙", `
        <p style="margin:0;color:#cbd5e1;font-size:14px;line-height:1.7">
          Merhaba <strong style="color:#f1f5f9">${safeName}</strong>, maalesef şu an başvurunu kabul edemiyoruz.
          İlgine teşekkür ederiz — ileride farklı bir zamanda tekrar başvurmaktan çekinme.
        </p>
      `)
    );
  }
}
