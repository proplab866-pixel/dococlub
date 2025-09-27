import nodemailer from "nodemailer";

// Hostinger SMTP Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: Number(process.env.SMTP_PORT) === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Professional HTML template for OTP email (registration/resend-otp)
function getOTPEmailHtml(otp: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="padding: 32px 32px 16px 32px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #2563eb; letter-spacing: 2px; margin-bottom: 8px;">DocoClub</div>
            <div style="font-size: 1.1rem; color: #555; margin-bottom: 24px;">Investment Club for Everyone</div>
            <div style="font-size: 1.25rem; color: #222; margin-bottom: 8px;">Hello,</div>
            <div style="font-size: 1rem; color: #444; margin-bottom: 24px;">Thank you for using DocoClub. Please use the following OTP:</div>
            <div style="display: inline-block; padding: 16px 32px; background: #2563eb; color: #fff; font-size: 2rem; font-weight: bold; border-radius: 8px; letter-spacing: 6px; margin-bottom: 24px;">${otp}</div>
            <div style="font-size: 1rem; color: #444; margin: 24px 0 8px 0;">This OTP is valid for <b>10 minutes</b>. Please do not share this code with anyone.</div>
            <div style="font-size: 0.95rem; color: #888; margin-bottom: 32px;">If you did not request this, you can safely ignore this email.</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <div style="font-size: 0.9rem; color: #aaa;">&copy; ${new Date().getFullYear()} DocoClub. All rights reserved.</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// Professional HTML template for password reset OTP
function getResetPasswordEmailHtml(otp: string): string {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f6f8fa; padding: 40px 0;">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 480px; margin: 0 auto; background: #fff; border-radius: 10px; box-shadow: 0 2px 8px rgba(0,0,0,0.06);">
        <tr>
          <td style="padding: 32px 32px 16px 32px; text-align: center;">
            <div style="font-size: 2rem; font-weight: bold; color: #2563eb; letter-spacing: 2px; margin-bottom: 8px;">DocoClub</div>
            <div style="font-size: 1.1rem; color: #555; margin-bottom: 24px;">Password Reset Request</div>
            <div style="font-size: 1.25rem; color: #222; margin-bottom: 8px;">Hello,</div>
            <div style="font-size: 1rem; color: #444; margin-bottom: 24px;">We received a request to reset your DocoClub account password. Use the following One-Time Password (OTP) to proceed:</div>
            <div style="display: inline-block; padding: 16px 32px; background: #2563eb; color: #fff; font-size: 2rem; font-weight: bold; border-radius: 8px; letter-spacing: 6px; margin-bottom: 24px;">${otp}</div>
            <div style="font-size: 1rem; color: #444; margin: 24px 0 8px 0;">This OTP is valid for <b>10 minutes</b>. If you did not request a password reset, you can safely ignore this email.</div>
            <div style="font-size: 0.95rem; color: #888; margin-bottom: 32px;">For your security, do not share this code with anyone.</div>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <div style="font-size: 0.9rem; color: #aaa;">&copy; ${new Date().getFullYear()} DocoClub. All rights reserved.</div>
          </td>
        </tr>
      </table>
    </div>
  `;
}

// Verify SMTP connection
export async function verifySMTPConnection() {
  try {
    console.log(process.env.SMTP_USER, process.env.SMTP_PASS);
    await transporter.verify();
    console.log("SMTP connection verified successfully");
    return true;
  } catch (error) {
    console.error("SMTP connection failed:", error);
    return false;
  }
}

export async function sendEmail({
  to,
  subject,
  text,
  html,
}: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  try {
    const info = await transporter.sendMail({
      from: '"Dococlub Verification" <verification@dococlub.com>',
      to,
      subject,
      text,
      html,
    });
    console.log("Email sent successfully:", info.messageId);
    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
}

/**
 * Send an OTP email for either registration/verify-email or password reset.
 * @param email recipient email
 * @param otp the OTP code
 * @param purpose 'verify-email' | 'reset-password'
 */
export async function sendOTPEmail(
  email: string,
  otp: string,
  purpose: "verify-email" | "reset-password" = "verify-email"
) {
  let subject = "Your DocoClub OTP Verification Code";
  let text = `Your OTP code is: ${otp}`;
  let html = getOTPEmailHtml(otp);
  if (purpose === "reset-password") {
    subject = "Your DocoClub Password Reset OTP";
    text = `Your password reset OTP code is: ${otp}`;
    html = getResetPasswordEmailHtml(otp);
  }
  return sendEmail({ to: email, subject, text, html });
}
