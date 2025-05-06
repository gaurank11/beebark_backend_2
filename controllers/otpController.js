const Otp = require('../models/Otp');
const User = require('../models/User');
const generateAndSendOtp = require('../utils/generateAndSendOtp');


const sendOtp = async (req, res) => {
    try {
      await generateAndSendOtp(req.body.email);
      res.status(200).json({ message: 'OTP sent' });
    } catch (err) {
      res.status(500).json({ message: 'Server error', error: err.message });
    }
  };

// Verify OTP
const verifyOtp = async (req, res) => {
    const { email, otp } = req.body;
  
    try {
      const record = await Otp.findOne({ email, otp });
  
      if (!record || record.expiresAt < Date.now()) {
        return res.status(400).json({ message: 'Invalid or expired OTP' });
      }
  
      // Mark the user as verified
      await User.findOneAndUpdate({ email }, { isVerified: true });
  
      // Optional: clear OTP
      await Otp.deleteOne({ _id: record._id });
  
      res.status(200).json({ message: 'OTP verified successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Server Error', error: err.message });
    }
  };

module.exports = { sendOtp, verifyOtp };
