const Otp = require('../models/Otp');
const generateAndSendOtp = require('../utils/generateAndSendOtp');

const resendOtp = async (req, res) => {
  const { email } = req.body;

  try {
    const existingOtp = await Otp.findOne({ email });

    if (existingOtp) {
      const timeSinceLastOtp = Date.now() - existingOtp.createdAt.getTime();

      // If less than 60 seconds since last OTP
      if (timeSinceLastOtp < 60 * 1000) {
        const remainingSeconds = Math.ceil((60 * 1000 - timeSinceLastOtp) / 1000);
        return res.status(429).json({
          message: `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
        });
      }

      // Delete existing OTP to replace with a new one
      await Otp.deleteOne({ email });
    }

    // Generate and send new OTP
    await generateAndSendOtp(email);

    res.status(200).json({ message: 'A new OTP has been sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = resendOtp;
