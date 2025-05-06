const User = require('../models/User');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');
const cloudinary = require('../config/cloudinary');
const generateAndSendOtp = require('../utils/generateAndSendOtp');

// Register a new user
const registerUser = async (req, res) => {
  const { firstname, lastname, name, email, password, phone, countryCode, category, otherCategory } = req.body;

  try {
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      firstname,
      lastname,
      name,
      email,
      password: hashedPassword,
      phone,
      countryCode,
      category,
      otherCategory: category === "others" ? otherCategory : "",
    });

    const savedUser = await newUser.save();

    await sendEmail(
      email,
      'Welcome to Beebark - Let\'s Get You Started',
      `
      Hi ${firstname},
    
      Thanks for signing up on Beebark. You've taken the first step into a growing ecosystem designed to connect people, ideas, and possibilities in the built environment.
      
      To complete your registration, we just need to verify your email.
    
      Next Step: Please check your inbox for the OTP and enter it to confirm your email.
    
      If you didn't request this registration, feel free to ignore this message.
    
      See you on the inside,
      
      Team Beebark
      `
    );
    await generateAndSendOtp(email); // ✅ Call without sending response

    res.status(201).json({ message: 'User registered successfully, OTP sent to email.', user: savedUser });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err.message });
  }
};

// Login User
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(200).json({ token, user });
  } catch (err) {
    res.status(500).json({ message: 'Server Error', error: err });
  }
};

// Forgot Password (sends OTP)
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await Otp.deleteMany({ email }); // Clean old OTPs
    await Otp.create({ email, otp, expiresAt });

    await sendEmail(email, 'Reset Password OTP', `Your OTP is: ${otp}`);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};



module.exports = { registerUser, loginUser, forgotPassword };
