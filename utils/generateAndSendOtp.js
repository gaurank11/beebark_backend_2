const Otp = require('../models/Otp');
const sendEmail = require('./sendEmail');

const generateAndSendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  await Otp.deleteMany({ email });
  await Otp.create({ email, otp, expiresAt });

  await sendEmail(
    email,
    `Your Beebark OTP is ${otp}`,
    `
      <div style="font-family: Arial, sans-serif; font-size: 16px; line-height: 1.6;">
        <p>Hi,</p>

        <p>Your One-Time Password (OTP) for verifying your email with <strong>Beebark</strong> is:</p>
        
        <h2>${otp}</h2>

        <p>Please enter this on the verification page to continue your onboarding process.</p>

        <p><strong>Note:</strong> This OTP is valid for <strong>10 minutes</strong>.</p>

        <p>If you didn't request this, please ignore this email.</p>

        <p>With purpose,</p>
        <p><strong>Team Beebark</strong></p>
      </div>
    `,
    'info@thebeebark.com' // Optional 4th argument if your sendEmail supports replyTo
  );
};

module.exports = generateAndSendOtp;
