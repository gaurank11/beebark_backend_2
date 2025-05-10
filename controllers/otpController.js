const Otp = require('../models/Otp');
const User = require('../models/User');
const generateAndSendOtp = require('../utils/generateAndSendOtp');
const sendEmail = require('../utils/sendEmail');


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
  const { email, otp, firstname } = req.body;

  try {
    const record = await Otp.findOne({ email, otp });

    if (!record || record.expiresAt < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    // Mark the user as verified
    await User.findOneAndUpdate({ email }, { isVerified: true });

    // Delete OTP record
    await Otp.deleteOne({ _id: record._id });

    // Send Welcome Email
    const user = await User.findOne({ email });
    if (user) {
      await sendEmail(
        email,
        "You’re In! Welcome to the Beebark Family 🌱",
        `
        Hey ${user.firstname},

        We’re genuinely excited to welcome you to Beebark — not just as a user, but as a valued part of something bigger. You’re not here by chance. You’re here because you belong.

        Beebark is more than a platform — it’s a growing ecosystem.
        A place where architects, builders, designers, contractors, and real estate creators connect, hire, collaborate, and grow — all under one digital roof.

        Whether you're searching for new clients, trusted talent, or like-minded professionals to build with — you’ve just stepped into a space designed for you. Think of it as your digital HQ — where B2B and B2BC partnerships begin naturally and meaningfully.

        And here's the best part — this isn’t for everyone.
        We’re building Beebark with intention. By joining us now, you're among the first to shape how this community grows. You’re early, and that means you’re important.

        Settle in. Explore. Reach out. Collaborate.
        You're home now.

        Warm regards,  
        Team Beebark  
        www.thebeebark.com
        `
      );
    }

    res.status(200).json({ message: 'OTP verified successfully' }); // Frontend will navigate to login
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};


module.exports = { sendOtp, verifyOtp };
