import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (to, addPasswordLink) => {
  const subject = "ECBARKO - Set Your Password";

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Set Password</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#ffffff;">
    <div style="max-width:600px; margin:40px auto; padding:20px;">
      <h1 style="color:#4a4a4a; text-align:center; margin-bottom:20px;">
        🚢 ECBARKO
      </h1>
      <h2 style="color:#3b3b3b; text-align:center;">Hello!</h2>
      <p style="font-size:16px; color:#333; text-align:center;">
        Your <b>ECBARKO</b> account has been created by request.  
        Click the button below to set your password and access your account:
      </p>

      <div style="text-align:center; margin:30px 0;">
        <a href="${addPasswordLink}" 
           style="display:inline-block; padding:16px 40px; background:linear-gradient(90deg,#667eea,#764ba2);
                  color:#fff; font-size:16px; font-weight:bold; text-decoration:none; border-radius:8px;">
          Set Password
        </a>
      </div>

      <div style="background:#fff3cd; color:#856404; padding:12px; border-radius:6px; font-size:14px; margin:20px 0;">
        ⚠️ <b>Important:</b> This link will expire in <b>10 minutes</b> for security reasons.
      </div>

      <div style="background:#d4edda; color:#155724; padding:12px; border-radius:6px; font-size:14px; margin:20px 0;">
        🔒 <b>Security Note:</b> Never share this link with anyone. ECBARKO staff will never ask for your password link.
      </div>

      <p style="font-size:14px; color:#555;">
        If you didn’t request this account, please:
        <ul>
          <li>Ignore this email</li>
          <li>Contact our support team if you have concerns</li>
        </ul>
      </p>

      <p style="font-size:14px; color:#555; text-align:center;">
        If the button doesn’t work, copy and paste this link into your browser:<br/>
        <a href="${addPasswordLink}" style="color:#3366cc;">${addPasswordLink}</a>
      </p>

      <p style="font-size:14px; color:#333; margin-top:30px;">
        Best regards,<br/>
        <b>ECBARKO Team</b>
      </p>
    </div>
  </body>
  </html>
  `;

  const msg = {
    to,
    from: process.env.SENDGRID_FROM_EMAIL,
    subject,
    text: "Use this link to set your password.",
    html
  };

  await sgMail.send(msg);
};

export default sendEmail;
