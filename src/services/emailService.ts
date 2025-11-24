import nodemailer from "nodemailer";

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text: string;
}

// Create reusable transporter
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) {
    return transporter;
  }

  // Check for required environment variables
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP configuration is missing. Please set SMTP_HOST, SMTP_USER, and SMTP_PASS");
  }

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || "587"),
    secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
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
    
    await mailTransporter.sendMail({
      from: process.env.SMTP_FROM_EMAIL,
      to,
      subject,
      text,
      html: html || text,
    });
    
    console.log(`📧 Email sent successfully to ${to}`);
  } catch (error: any) {
    console.error("❌ Email send error:", error.message);
    throw new Error(`Failed to send email: ${error.message}`);
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
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563EB;">📉 Price Drop Alert!</h2>
      <p>Great news! The price of <strong>"${productTitle}"</strong> has dropped to <strong style="color: #10B981;">₹${currentPrice}</strong>, which is below your target price of ₹${targetPrice}.</p>
      <p><a href="${productUrl}" style="background-color: #2563EB; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Product on Amazon</a></p>
      <p style="color: #6B7280; font-size: 12px; margin-top: 20px;">Happy Shopping! 🛒</p>
    </div>
  `;

  await sendEmail({ to: email, subject, text, html });
}
