const nodemailer = require('nodemailer');
require('dotenv').config(); // if you're using a .env file

const sendEmail = async (to, subject, text) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS, // Use your Gmail App Password here
    },
    tls: {
      rejectUnauthorized: false, // Accept self-signed certificates (use only in dev)
    },
  });

  const mailOptions = {
    from: process.env.SMTP_USER,
    to,
    subject,
    text,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.response);
  } catch (err) {
    console.error('Error sending email:', err);
  }
};

module.exports = sendEmail;
