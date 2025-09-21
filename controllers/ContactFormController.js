import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

// Make sure environment variables are loaded
dotenv.config();

// Configure nodemailer with your email service credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME || 'ecbarkoportal@gmail.com',
    // For App Password, remove the spaces when using it
    pass: process.env.EMAIL_PASSWORD ? process.env.EMAIL_PASSWORD.replace(/\s+/g, '') : ''
  }
});

// Process Contact Form Submission
const sendContactMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ 
        success: false, 
        message: "All fields are required" 
      });
    }

    // Log the contact request
    console.log('Contact form submission:', {
      name,
      email,
      message: message.substring(0, 30) + (message.length > 30 ? '...' : '')
    });

    // 1. Email to the admin/company
    const adminMailOptions = {
      from: process.env.EMAIL_USERNAME || 'ecbarkoportal@gmail.com',
      to: process.env.EMAIL_USERNAME || 'ecbarkoportal@gmail.com', // The company email address
      subject: `New Contact Form Message from ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a;">New Message from Contact Form</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #013986; margin-left: 20px;">${message}</p>
          <p style="color: #888; font-size: 12px; margin-top: 30px;">© ${new Date().getFullYear()} EcBarko. All rights reserved.</p>
        </div>
      `
    };

    // 2. Confirmation email to the sender
    const senderMailOptions = {
      from: process.env.EMAIL_USERNAME || 'ecbarkoportal@gmail.com',
      to: email,
      subject: 'Thank you for contacting EcBarko',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
          <h2 style="color: #4a4a4a; text-align: center;">Thank You for Contacting EcBarko!</h2>
          <p style="color: #666; line-height: 1.6;">Dear ${name},</p>
          <p style="color: #666; line-height: 1.6;">We've received your message and will get back to you as soon as possible.</p>
          <p style="color: #666; line-height: 1.6;">Here's a copy of your message:</p>
          <p style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #013986; margin-left: 20px;">${message}</p>
          <div style="text-align: center; margin-top: 30px;">
            <a href="https://ecbarko-kr8b.onrender.com/" style="background-color: #013986; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; font-weight: bold;">Visit Our Website</a>
          </div>
          <p style="color: #888; font-size: 12px; margin-top: 30px; text-align: center;">© ${new Date().getFullYear()} EcBarko. All rights reserved.</p>
        </div>
      `
    };

    // Send both emails
    await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(senderMailOptions)
    ]);

    // Respond with success
    res.status(200).json({ 
      success: true, 
      message: "Your message has been sent successfully!" 
    });
  } catch (error) {
    console.error("Contact form email sending failed:", error);
    
    res.status(500).json({ 
      success: false, 
      message: "Failed to send your message. Please try again later.",
      error: error.message
    });
  }
};

export { sendContactMessage };