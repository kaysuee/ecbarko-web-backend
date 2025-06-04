import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Make sure environment variables are loaded
dotenv.config();

// Configure nodemailer with your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME || 'ecbarkoportal@gmail.com',
    // For App Password, remove the spaces when using it in code
    pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : ''
  }
});

// Email template for auto-reply
const getEmailTemplate = () => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
      <h2 style="color: #4a4a4a; text-align: center;">Thank You for Contacting EcBarko!</h2>
      <p style="color: #666; line-height: 1.6;">We've received your email inquiry and will get back to you as soon as possible. In the meantime, you might find answers to common questions in our FAQ section on our website.</p>
      <div style="text-align: center; margin-top: 30px;">
        <a href="https://yourwebsite.com" style="background-color: #013986; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Visit Our Website</a>
      </div>
      <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} EcBarko. All rights reserved.</p>
    </div>
  `;
};

// For debugging - log configuration without showing actual password
console.log('Email configuration loaded:', {
  user: process.env.EMAIL_USERNAME || 'ecbarkoportal@gmail.com',
  passwordProvided: Boolean(process.env.EMAIL_PASSWORD)
});

// Send automatic reply email
const sendAutomaticEmail = async (req, res) => {
  try {
    const { email } = req.body;

    // Log request for debugging
    console.log('Received email request:', {
      body: req.body,
      email: email
    });

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Email options
    const mailOptions = {
      from: process.env.EMAIL_USERNAME || 'ecbarkoportal@gmail.com',
      to: email,
      subject: 'Thank you for contacting EcBarko',
      html: getEmailTemplate()
    };

    console.log('Attempting to send email to:', email);

    // Send email
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Email sent successfully:', info);

    res.status(200).json({ 
      message: "Email sent successfully",
      info: info.response
    });
  } catch (error) {
    console.error("Email sending failed - FULL ERROR:", error);
    
    // Detailed error information for debugging
    const errorDetails = {
      message: error.message,
      code: error.code,
      command: error.command,
      stack: error.stack
    };
    
    console.error("Error details:", errorDetails);
    
    res.status(500).json({ 
      message: "Failed to send email", 
      error: error.message,
      details: errorDetails
    });
  }
};

export { sendAutomaticEmail };