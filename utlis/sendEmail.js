import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// ✅ core sender
const sendEmail = async (to, subject, text, html) => {
  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL, 
    subject,
    text,
    html
  };
  await sgMail.send(msg);
};

// ✅ setup password email template
export const generateSetupEmail = (link, name) => `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>ECBARKO Account Setup</title>
  </head>
  <body style="font-family: Arial, sans-serif; background:#f8f9fa; padding:20px;">
    <div style="max-width:600px;margin:0 auto;background:white;padding:20px;border-radius:10px;">
      <h2 style="color:#2563eb;">Welcome to ECBARKO, ${name || 'User'}!</h2>
      <p>An administrator has created your account. Please click the button below to set your password and activate your account:</p>
      <p style="text-align:center;margin:30px 0;">
        <a href="${link}" style="background:#2563eb;color:white;padding:12px 24px;text-decoration:none;border-radius:6px;font-weight:bold;">
          Set My Password
        </a>
      </p>
      <p><strong>⚠️ This link expires in 1 hour.</strong></p>
      <p style="color:#666;">If the button doesn’t work, copy this link into your browser:</p>
      <p style="word-break:break-all;color:#2563eb;">${link}</p>
      <br/>
      <p>Best regards,<br/>ECBARKO Team 🚢</p>
    </div>
  </body>
  </html>
`;

export default sendEmail;
