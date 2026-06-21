import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend(): Resend | null {
  if (!resendInstance) {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey || apiKey === "re_your-resend-api-key") return null;
    resendInstance = new Resend(apiKey);
  }
  return resendInstance;
}

export async function sendVerificationEmail(email: string, token: string) {
  const resend = getResend();
  if (!resend) {
    console.log(`[DEV] Verification email for ${email}: token=${token}`);
    return;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const verifyUrl = `${appUrl}/verify?token=${token}`;

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "GudangKlip <noreply@gudangklip.com>",
    to: email,
    subject: "Verifikasi Email - GudangKlip",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a1a;color:#e8e8f0;border-radius:16px;border:1px solid #2a2a50">
        <div style="text-align:center;margin-bottom:24px">
          <span style="display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;border-radius:12px;background:linear-gradient(135deg,#6c63ff,#3b82f6);font-size:20px;font-weight:bold;color:#fff">G</span>
        </div>
        <h2 style="text-align:center;color:#fff;margin-bottom:12px">Verifikasi Email Kamu</h2>
        <p style="text-align:center;color:#8888aa;margin-bottom:24px">Klik tombol di bawah untuk verifikasi email dan aktifkan akun GudangKlip kamu.</p>
        <div style="text-align:center;margin-bottom:24px">
          <a href="${verifyUrl}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#6c63ff,#3b82f6);color:#fff;text-decoration:none;border-radius:999px;font-weight:600;font-size:14px">Verifikasi Email</a>
        </div>
        <p style="text-align:center;font-size:12px;color:#666688">Atau copy link ini: ${verifyUrl}</p>
        <hr style="border:none;border-top:1px solid #2a2a50;margin:24px 0" />
        <p style="font-size:11px;color:#555566;text-align:center">GudangKlip - Marketplace Clipping Indonesia</p>
      </div>
    `,
  });
}

export async function sendPayoutNotification(
  email: string,
  name: string,
  amount: number,
  status: "COMPLETED" | "FAILED"
) {
  const resend = getResend();
  if (!resend) {
    console.log(`[DEV] Payout notification for ${email}: ${status} Rp ${amount}`);
    return;
  }

  await resend.emails.send({
    from: process.env.EMAIL_FROM || "GudangKlip <noreply@gudangklip.com>",
    to: email,
    subject: status === "COMPLETED" ? "Pencairan Berhasil - GudangKlip" : "Pencairan Gagal - GudangKlip",
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:24px;background:#0a0a1a;color:#e8e8f0;border-radius:16px;border:1px solid #2a2a50">
        <h2 style="color:#fff">${status === "COMPLETED" ? "Pencairan Berhasil!" : "Pencairan Gagal"}</h2>
        <p style="color:#8888aa">Halo ${name},</p>
        <p style="color:#8888aa">
          ${status === "COMPLETED"
            ? `Pencairan dana sebesar Rp ${amount.toLocaleString("id-ID")} telah berhasil diproses.`
            : `Maaf, pencairan dana sebesar Rp ${amount.toLocaleString("id-ID")} gagal diproses. Dana telah dikembalikan ke saldo kamu.`
          }
        </p>
      </div>
    `,
  });
}
