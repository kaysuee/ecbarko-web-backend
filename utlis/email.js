import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
    service: "gmail",
    debug: true,
    port: 587,
    secure: false,
    auth: {
        user: 'ecbarkoportal@gmail.com',
        pass: 'ocfmgagwogsnxyue',
    },
});

export const  sendOtpEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ECBARKO OTP',
    text: `Your OTP code is: ${otp}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// export const sendResetEmail = async (email, reset) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: email,
//     subject: 'ECBARKO Email Reset',
//     text: `Your reset link: ${reset}`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${email}`);
//   } catch (error) {
//     console.error('Error sending email:', error);
//   }
// };

export const sendResetEmail = async (email, reset) => {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>ECBARKO Password Reset</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
          background-color: #f8f9fa;
        }
        .container {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          padding: 30px 20px 20px;
          background: white;
        }
        .logo {
          display: inline-flex;
          align-items: center;
          font-size: 24px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 10px;
        }
        .logo::before {
          content: "🚢";
          margin-right: 8px;
          font-size: 20px;
        }
        .title {
          font-size: 18px;
          color: #374151;
          margin: 0;
        }
        .content {
          padding: 20px 30px;
        }
        .divider {
          height: 3px;
          background: linear-gradient(90deg, #3b82f6, #8b5cf6);
          margin: 0;
        }
        .greeting {
          margin-bottom: 20px;
          font-size: 16px;
        }
        .description {
          margin-bottom: 30px;
          color: #6b7280;
        }
        .reset-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 12px;
          padding: 30px;
          text-align: center;
          margin: 20px 0;
        }
        .reset-button {
          display: inline-block;
          background: #ffffff;
          color: #667eea;
          padding: 15px 30px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          margin-top: 10px;
          transition: all 0.3s ease;
        }
        .reset-button:hover {
          background: #f8f9ff;
          transform: translateY(-2px);
        }
        .reset-text {
          color: white;
          font-size: 14px;
          margin-bottom: 10px;
        }
        .warning-box {
          background: #fef3c7;
          border-left: 4px solid #f59e0b;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .warning-text {
          margin: 0;
          font-size: 14px;
          color: #92400e;
        }
        .security-box {
          background: #dcfce7;
          border-left: 4px solid #10b981;
          padding: 15px;
          margin: 20px 0;
          border-radius: 0 8px 8px 0;
        }
        .security-text {
          margin: 0;
          font-size: 14px;
          color: #065f46;
        }
        .instructions {
          margin: 20px 0;
          color: #374151;
        }
        .instructions ul {
          padding-left: 20px;
        }
        .instructions li {
          margin: 8px 0;
        }
        .footer {
          padding: 20px 30px;
          color: #6b7280;
          font-size: 14px;
        }
        .team-signature {
          color: #374151;
          font-weight: 500;
        }
        @media (max-width: 480px) {
          body {
            padding: 10px;
          }
          .content {
            padding: 15px 20px;
          }
          .reset-section {
            padding: 20px;
          }
          .footer {
            padding: 15px 20px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">ECBARKO</div>
          <h1 class="title">Password Reset</h1>
        </div>
        
        <div class="divider"></div>
        
        <div class="content">
          <div class="greeting">Hello!</div>
          
          <p class="description">
            You've requested a password reset for your ECBARKO account. Click the button below to reset your password:
          </p>
          
          <div class="reset-section">
            <div class="reset-text">Click the button below to reset your password</div>
            <a href="${reset}" class="reset-button">Reset Password</a>
          </div>
          
          <div class="warning-box">
            <p class="warning-text">
              <strong>⚠️ Important:</strong> This reset link will expire in <strong>10 minutes</strong> for security reasons.
            </p>
          </div>
          
          <div class="security-box">
            <p class="security-text">
              <strong>🔒 Security Note:</strong> Never share this link with anyone. ECBARKO staff will never ask for your reset link.
            </p>
          </div>
          
          <div class="instructions">
            If you didn't request this password reset, please:
            <ul>
              <li>Ignore this email</li>
              <li>Check your account security settings</li>
              <li>Contact our support team if you have concerns</li>
            </ul>
          </div>
        </div>
        
        <div class="footer">
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #2563eb;">${reset}</p>
          <br>
          <p>Best regards,</p>
          <p class="team-signature">ECBARKO Team</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ECBARKO Password Reset',
    text: `Your password reset link: ${reset}`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
  }
};

export const sendResetPassword = async (email, Password) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'ECBARKO Email Reset',
    text: `Your New Password: ${Password}`,
  };
  console.log(`Email sent to ${email}`);
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}`);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


