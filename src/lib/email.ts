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

export async function sendVerificationEmail(email: string, token: string) {
  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`;

  const mailOptions = {
    from: `"PricePulse" <${process.env.SMTP_FROM_EMAIL}>`,
    to: email,
    subject: "Verify your PricePulse Account",
    html: `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />

<style>
  body {
    margin:0;
    padding:0;
    background:#f7fafc;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial;
    color:#0f172a;
  }

  a { color:#2563EB; text-decoration:none; }

  .container {
    max-width:640px;
    margin:32px auto;
    background:#ffffff;
    border-radius:16px;
    overflow:hidden;
    border:1px solid #e5e7eb;
    box-shadow:0 6px 28px rgba(0,0,0,0.06);
  }

  .hero img {
    width:100%;
    height:220px;
    object-fit:cover;
    display:block;
  }

  .content {
    padding:32px;
  }

  h1 {
    font-size:24px;
    font-weight:700;
    text-align:center;
    margin:0 0 10px;
    color:#0f172a;
  }

  p {
    color:#475569;
    font-size:15px;
    line-height:1.6;
    margin:14px 0;
  }

  .btn-wrapper {
    text-align:center;
    margin:28px 0;
  }

  .btn {
    background:linear-gradient(90deg,#2563EB,#1D4ED8);
    padding:14px 28px;
    border-radius:10px;
    color:#ffffff !important;
    font-weight:600;
    font-size:15px;
    display:inline-block;
    box-shadow:0 4px 14px rgba(37,99,235,0.25);
  }

  .fallback-link {
    background:#eff6ff;
    border:1px solid #dbeafe;
    padding:12px;
    border-radius:8px;
    word-break:break-all;
    color:#1d4ed8;
    font-size:14px;
    margin-top:12px;
  }

  .footer {
    background:#f9fafb;
    padding:20px;
    text-align:center;
    color:#6b7280;
    font-size:13px;
    border-top:1px solid #e5e7eb;
  }

  .footer a {
    color:#2563EB;
  }

  .socials img {
    width:22px;
    height:22px;
    margin:0 6px;
    opacity:0.85;
  }
</style>

</head>
<body>

<div class="container">

  <!-- HERO IMAGE -->
  <div class="hero">
    <img src="https://res.cloudinary.com/doexqrehm/image/upload/v1763981801/pricepulse4_kqwntp.png" alt="PricePulse Banner" />
  </div>

  <div class="content">

    <h1>Verify Your Email</h1>

    <p>
      Welcome to <strong>PricePulse</strong> — your smart Amazon price-tracking assistant.
      To activate your account and start receiving real-time price-drop alerts,
      please verify your email address below.
    </p>

    <!-- CTA BUTTON -->
    <div class="btn-wrapper">
      <a href="${verificationUrl}" class="btn">Verify Email</a>
    </div>

    <p>If the button doesn’t work, use this link:</p>

    <div class="fallback-link">
      ${verificationUrl}
    </div>

    <p style="font-size:13px; color:#6b7280; margin-top:20px;">
      The verification link expires in 24 hours.
      If you did not request this email, you can safely ignore it.
    </p>

  </div>

  <!-- FOOTER -->
  <div class="footer">
    <strong>PricePulse</strong> — Smart Amazon Price Tracking<br/>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}">${process.env.NEXT_PUBLIC_APP_URL}</a>

    <div style="margin-top:10px;">© ${new Date().getFullYear()} PricePulse. All rights reserved.</div>
  </div>

</div>

</body>
</html>
`,
  };

  await transporter.sendMail(mailOptions);
}
