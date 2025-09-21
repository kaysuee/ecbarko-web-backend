import sgMail from "@sendgrid/mail";
import dotenv from "dotenv";

dotenv.config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const getEmailTemplate = () => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #4a4a4a; text-align: center;">Thank You for Contacting EcBarko!</h2>
      <p style="color: #666; line-height: 1.6;">We've received your email inquiry and will get back to you as soon as possible. In the meantime, you might find answers to common questions in our FAQ section on our website.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://yourwebsite.com" style="background-color: #013986; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Visit Our Website</a>
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">&copy; ${new Date().getFullYear()} EcBarko. All rights reserved.</p>
    </div>
  `;
};

const sendAutomaticEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL, // Must be verified sender in SendGrid
      subject: "Thank you for contacting EcBarko",
      html: getEmailTemplate(),
      replyTo: "yourgmail@gmail.com",
    };

    await sgMail.send(msg);

    res.status(200).json({
      success: true,
      message: "Email sent successfully via SendGrid",
    });
  } catch (error) {
    console.error("SendGrid Error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send email",
      error: error.response?.body || error.message,
    });
  }
};

export { sendAutomaticEmail };
