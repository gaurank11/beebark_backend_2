const User = require('../models/User');
const Referral = require('../models/Referral');
const cloudinary = require('cloudinary').v2;
const qs = require('qs');
const mongoose = require('mongoose'); // Ensure mongoose is required here as well

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

// ✅ GET USER PROFILE
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
        const parsedBody = qs.parse(req.body);
        console.log('Parsed Body:', parsedBody);

        const userId = req.user._id;
        const existingUser = await User.findById(userId);

        if (!existingUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const updates = {
            firstname: parsedBody.firstname,
            lastname: parsedBody.lastname,
            name: parsedBody.name,
            email: parsedBody.email,
            phone: parsedBody.p_no,
            countryCode: parsedBody.p_code,
            category: parsedBody.category,
            bio: parsedBody.bio,
            establishmentYear: parsedBody.establishmentYear,
            yearOfExperience: parsedBody.yearOfExperience,
            licenseNumber: parsedBody.licenseNumber,
            isOpenToFreelance: parsedBody.isOpenToFreelance,
            openToCollaboration: parsedBody.openToCollaboration,
            openToHiringOrInternship: parsedBody.openToHiringOrInternship,
            availability: {
                fullTime: parsedBody.availability?.fullTime === 'true',
                partTime: parsedBody.availability?.partTime === 'true',
            },
            facebook: parsedBody.facebook,
            twitter: parsedBody.twitter,
            linkedin: parsedBody.linkedin,
            website: parsedBody.website,
            country: parsedBody.country, 
            state: parsedBody.state,
            city: parsedBody.city,
            pincode: parsedBody.pincode,
        };

        if (parsedBody.workHistory !== undefined) {
            updates.workHistory = parsedBody.workHistory || [];
        }
        if (parsedBody.testimonials !== undefined) {
            updates.testimonials = parsedBody.testimonials || [];
        }
        if (parsedBody.awards !== undefined) {
            updates.awards = parsedBody.awards || [];
        }
        if (parsedBody.projects !== undefined) {
            updates.projects = parsedBody.projects || [];
        }
        if (parsedBody.teamMembers !== undefined) {
            updates.teamMembers = parsedBody.teamMembers.map(memberData => ({
                name: memberData.name,
                role: memberData.role,
                bio: memberData.bio,
                linkedProfileId: memberData.linkedProfileId,
            }));
        }
        if (parsedBody.certifications !== undefined) {
            updates.certifications = Array.isArray(parsedBody.certifications) ? parsedBody.certifications : (parsedBody.certifications ? parsedBody.certifications.split(',').map(item => item.trim()) : []);
        }
        if (parsedBody.associations !== undefined) {
            updates.associations = Array.isArray(parsedBody.associations) ? parsedBody.associations : (parsedBody.associations ? parsedBody.associations.split(',').map(item => item.trim()) : []);
        }
        if (parsedBody.languageSpoken !== undefined) {
            updates.languageSpoken = Array.isArray(parsedBody.languageSpoken) ? parsedBody.languageSpoken : (parsedBody.languageSpoken ? [parsedBody.languageSpoken] : []);
        }

        if (parsedBody.password) {
            updates.password = parsedBody.password;
        }

        const { profilePhoto, coverImage, businessLogo } = req.files || {};
        if (profilePhoto?.[0]) {
            updates.profilePhoto = await uploadImageToCloudinary(profilePhoto[0]);
        }
        if (coverImage?.[0]) {
            updates.coverImage = await uploadImageToCloudinary(coverImage[0]);
        }
        if (businessLogo?.[0]) {
            updates.businessLogo = await uploadImageToCloudinary(businessLogo[0]);
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true,
        });

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

// refer friend
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

module.exports = {
    getUserProfile,
    updateUserProfile,
    referFriend,
};