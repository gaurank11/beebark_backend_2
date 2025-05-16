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

//  GET USER PROFILE
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

//  UPDATE USER PROFILE
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
            phoneBusiness : parsedBody.b_no,
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
            address: parsedBody.address,
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

// Helper function to validate email format (basic)
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ✅ REFER A FRIEND
const referFriend = async (req, res) => {
    try {
        const { friendEmail } = req.body;
        const referrer = req.user._id;
        const referrerUser = await User.findById(referrer);

        if (!friendEmail) {
            return res.status(400).json({
                success: false,
                message: "Friend's email address is required.",
            });
        }

        if (!isValidEmail(friendEmail)) {
            return res.status(400).json({
                success: false,
                message: "Please enter a valid email address.",
            });
        }

        // Check if the referral already exists for this referrer and email
        const existingReferral = await Referral.findOne({
            referrer: referrer,
            referredEmail: friendEmail,
        });

        if (existingReferral) {
            return res.status(409).json({
                success: false,
                message: "You have already sent an invitation to this email address.",
            });
        }

        const referralCode = uuidv4();

        // Create a new referral record with the unique code
        const newReferral = new Referral({
            referrer: referrer,
            referredEmail: friendEmail,
            referralCode: referralCode,
        });

        await newReferral.save();

        // Construct the referral link (you'll need to define your signup URL)
        const referralLink = `${process.env.CLIENT_URL}/signup?ref=${referralCode}`;

        const emailSubject = 'Hey you are invited you to join Beebark!';
        const emailHtml = `
            <p>Hi there,</p>
            <p> (${referrerUser.email}) thought you might be interested in joining Beebark - The Future of Architectural Networking & Marketing!</p>
            <p>Click the link below to sign up:</p>
            <p><a href="${referralLink}" style="display: inline-block; background-color: #facc15; color: #221912; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join Beebark</a></p>
            <p>By joining through this link, you might be eligible for special benefits!</p>
            <p>We look forward to seeing you on Beebark!</p>
            <p>Best regards,<br>The Beebark Team</p>
        `;

        await sendEmail(friendEmail, emailSubject, emailHtml);

        console.log(`${referrerUser.email} (ID: ${referrer}) referred a friend: ${friendEmail} with code: ${referralCode}`);

        res.status(200).json({
            success: true,
            message: `Invitation sent successfully to ${friendEmail}.`,
        });
    } catch (error) {
        console.error("Refer Friend Error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send referral invitation.",
            error: error.message,
        });
    }
};
module.exports = {
    getUserProfile,
    updateUserProfile,
    referFriend,
};