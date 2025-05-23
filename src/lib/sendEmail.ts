import sgMail from "@sendgrid/mail";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function sendEmail(to: string, subject: string, text: string) {
  try {
    await sgMail.send({
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (error: any) {
    console.error("❌ Email send error:", error.response?.body || error.message);
    throw error;
  }
}
