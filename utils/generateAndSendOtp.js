const Otp = require('../models/Otp');
const sendEmail = require('./sendEmail');

const generateAndSendOtp = async (email) => {
  // Generate a 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Set the OTP expiration time to 10 minutes from now
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

  // Delete any existing OTP record for the email
  await Otp.deleteMany({ email });

  // Create a new OTP record
  await Otp.create({ email, otp, expiresAt });

  // Send the OTP email
  await sendEmail(
    email,
    `Your Beebark OTP is ${otp}`,
    `
    Hi User,

    Your One-Time Password (OTP) for verifying your email with Beebark is:

    ${otp}

    Please enter this on the verification page to continue your onboarding.

    The OTP is valid for 10 minutes.

    If you didn't request this, please ignore this email.

    With purpose,
    Team Beebark
    `
  );
};

module.exports = generateAndSendOtp;
