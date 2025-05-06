const User = require('../models/User');
const Referral = require('../models/Referral');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload image to Cloudinary
const uploadImageToCloudinary = async (file, folder = "users") => {
  try {
    const result = await cloudinary.uploader.upload(file.path, {
      folder,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    throw new Error("Failed to upload image to Cloudinary: " + error.message);
  }
};

// ✅ GET USER PROFILE (Now expects userId in query)
const getUserProfile = async (req, res) => {
  try {
    const userId = req.query.userId; // Get user ID from query

    if (!userId) {
      return res.status(400).json({ success: false, message: "User ID is required" });
    }

    const userData = await User.findById(userId).select("-password");

    if (!userData) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.json({ success: true, userData });
  } catch (error) {
    console.error("Get Profile Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ✅ UPDATE USER PROFILE
const updateUserProfile = async (req, res) => {
  try {
    const updates = {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
      personalPhone: req.body.personalPhone,
      countryCode: req.body.countryCode,
      category: req.body.category,
      profileType: req.body.profileType,
      bio: req.body.bio,
      establishmentYear: req.body.establishmentYear,
      yearOfExperience: req.body.yearOfExperience,
      licenseNumber: req.body.licenseNumber,
      isOpenToFreelance: req.body.isOpenToFreelance,
      openToCollaboration: req.body.openToCollaboration,
      openToHiringOrInternship: req.body.openToHiringOrInternship,
      certifications: req.body.certifications,
      associations: req.body.associations,
      languageSpoken: req.body.languageSpoken,
      workHistory: req.body.workHistory,
      testimonials: req.body.testimonials,
      awards: req.body.awards,
      projects: req.body.projects,
      teamMembers: req.body.teamMembers,
      socialLinks: {
        facebook: req.body.socialLinks?.facebook,
        twitter: req.body.socialLinks?.twitter,
        linkedin: req.body.socialLinks?.linkedin,
        website: req.body.socialLinks?.website,
      },
      contact: {
        country: req.body.contact?.country,
        state: req.body.contact?.state,
        city: req.body.contact?.city,
        pincode: req.body.contact?.pincode,
      },
      availability: {
        fullTime: req.body.availability?.fullTime,
        partTime: req.body.availability?.partTime,
      },
    };

    // Handle password update if provided
    if (req.body.password) {
      updates.password = req.body.password; // You should hash this before saving in a real application
    }

    // Check for uploaded images
    const { profilePhoto, coverImage, businessLogo } = req.files || {};

    // Upload images if they exist and assign to updates
    if (profilePhoto?.[0]) {
      updates.profilePhoto = await uploadImageToCloudinary(profilePhoto[0]);
    }
    if (coverImage?.[0]) {
      updates.coverImage = await uploadImageToCloudinary(coverImage[0]);
    }
    if (businessLogo?.[0]) {
      updates.businessLogo = await uploadImageToCloudinary(businessLogo[0]);
    }

    // Update user in database
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updates, {
      new: true,
    });

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "User profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Update Profile Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile",
      error: error.message,
    });
  }
};

// ✅ REFER FRIEND
const referFriend = async (req, res) => {
  try {
    const { friendEmail } = req.body;
    const user = await User.findById(req.user._id);

    if (!friendEmail) {
      return res.status(400).json({
        success: false,
        message: "Friend email is required",
      });
    }

    // Log the referral
    console.log(`${user.email} referred a friend: ${friendEmail}`);

    res.status(200).json({
      success: true,
      message: `Referral sent to ${friendEmail}`,
    });
  } catch (error) {
    console.error("Refer Friend Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to refer friend",
      error: error.message,
    });
  }
};

// ✅ EXPORT CONTROLLERS
module.exports = {
  getUserProfile,
  updateUserProfile,
  referFriend,
};
