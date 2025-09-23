import sgMail from '@sendgrid/mail';
import dotenv from 'dotenv';

dotenv.config();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

export default sendEmail;
