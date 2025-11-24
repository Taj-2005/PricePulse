import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text: string;
}

let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS");
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  return transporter;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  const { to, subject, text, html } = options;

  if (!process.env.SMTP_FROM_EMAIL) {
    throw new Error("SMTP_FROM_EMAIL is not configured");
  }

  try {
    const mailTransporter = getTransporter();

    const info = await mailTransporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      text,
      html: html || text,
    });

    console.log("📧 Email send info:", {
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      response: info.response,
    });

  } catch (error: any) {
    console.error("❌ Email send error (sendEmail):", error);
    throw new Error(`Failed to send email: ${error.message || error}`);
  }
}


export async function sendPriceAlertEmail(
  email: string,
  productTitle: string,
  currentPrice: number,
  targetPrice: number,
  productUrl: string
): Promise<void> {
  const subject = "📉 Price Drop Alert from PricePulse!";
  const text = `Great news! The price of "${productTitle}" has dropped to ₹${currentPrice}, which is below your target price of ₹${targetPrice}.\n\nProduct Link: ${productUrl}\n\nHappy Shopping! 🛒`;
  
const html = `
  <div style="font-family: Arial, sans-serif; background:#f8fafc; padding:20px;">
    <div style="max-width:560px; margin:0 auto; background:#ffffff; padding:25px 30px; border-radius:12px; box-shadow:0 4px 12px rgba(0,0,0,0.06);">

      <h2 style="color:#1d4ed8; margin-top:0; font-size:22px; font-weight:700; text-align:center;">
        📉 Price Drop Alert
      </h2>

      <p style="font-size:15px; color:#374151; line-height:1.6;">
        Hi there! 👋<br><br>
        The price of <strong style="color:#1f2937;">${productTitle}</strong> has dropped!
      </p>

      <div style="margin:18px 0; padding:15px; background:#f1f5f9; border-radius:10px;">
        <p style="margin:0; font-size:15px; color:#1e293b;">
          Current Price:  
          <strong style="color:#059669; font-size:17px;">₹${currentPrice}</strong><br>
          Your Target Price:  
          <strong style="color:#dc2626;">₹${targetPrice}</strong>
        </p>
      </div>

      <p style="font-size:14px; color:#475569; line-height:1.6;">
        Since the current price is now below your alert threshold, this could be the perfect time to grab the deal! 🎉
      </p>

      <div style="text-align:center; margin:25px 0;">
        <a href="${productUrl}"
          style="
            background:#1d4ed8;
            color:#ffffff;
            padding:12px 22px;
            border-radius:8px;
            text-decoration:none;
            font-size:15px;
            font-weight:600;
            display:inline-block;
          "
        >
          View Product on Amazon
        </a>
      </div>

      <hr style="border:none; border-top:1px solid #e2e8f0; margin:25px 0;">

      <p style="font-size:12px; color:#6b7280; text-align:center;">
        You’re receiving this alert because you set a price threshold on <strong>PricePulse</strong>.<br>
        Happy Shopping! 🛒
      </p>
    </div>
  </div>
`;


  await sendEmail({ to: email, subject, text, html });
}
