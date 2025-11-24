// services/emailService.ts
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendResetPasswordEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}&email=${encodeURIComponent(
    email
  )}`;

  const html = `
  <!doctype html>
  <html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Reset your PricePulse password</title>
    <style>
      body { margin:0; padding:0; background:#f7fafc; font-family: -apple-system,BlinkMacSystemFont, "Segoe UI", Roboto, Arial; color:#0f172a;}
      .container { max-width:640px; margin:28px auto; background:#fff; border-radius:14px; overflow:hidden; border:1px solid #e6eef9; box-shadow:0 6px 30px rgba(14,65,200,0.06); }
      .hero img { width:100%; height:220px; object-fit:cover; display:block; }
      .content { padding:28px 32px; }
      h1 { font-size:22px; margin:0 0 8px; text-align:center; }
      p { color:#475569; font-size:15px; line-height:1.6; margin:12px 0; }
      .btn { display:inline-block; background:linear-gradient(90deg,#2563EB,#1D4ED8); color:#fff; padding:12px 26px; border-radius:10px; font-weight:600; box-shadow:0 6px 18px rgba(37,99,235,0.18); text-decoration:none; }
      .fallback { background:#eff6ff; border:1px solid #dbeafe; padding:12px; border-radius:8px; word-break:break-all; color:#1d4ed8; }
      .muted { color:#94a3b8; font-size:13px; text-align:center; margin-top:12px; }
      .footer { background:#fbfdff; padding:18px; text-align:center; border-top:1px solid #eef6ff; color:#6b7280; font-size:13px; }
    </style>
  </head>
  <body>
    <div class="container" role="article" aria-roledescription="email">
      <div class="hero">
        <!-- developer note: using the uploaded file path as requested (replace with hosted image URL) -->
        <img src="https://res.cloudinary.com/doexqrehm/image/upload/v1763981801/pricepulse4_kqwntp.png" alt="PricePulse" />
      </div>
      <div class="content">
        <h1>Reset your PricePulse password</h1>
        <p>We received a request to reset the password for your PricePulse account. Click the button below to set a new password.</p>
        <div style="text-align:center; margin:20px 0;">
          <a class="btn; color:white" href="${resetUrl}">Reset password</a>
        </div>
        <p>If the button doesn't work, paste the link below into your browser:</p>
        <div class="fallback">${resetUrl}</div>
        <p class="muted">This link is valid for 1 hour. If you did not request a password reset, you can safely ignore this email.</p>
      </div>
      <div class="footer">
        <strong>PricePulse</strong> — Smart Amazon price tracking<br/>
        <a href="${process.env.NEXT_PUBLIC_APP_URL}">${process.env.NEXT_PUBLIC_APP_URL}</a>
      </div>
    </div>
  </body>
  </html>
  `;

  await transporter.sendMail({
    from: `"PricePulse" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Reset your PricePulse password",
    html,
  });
}
