// models/Referral.js
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

const referralSchema = mongoose.Schema({
    referrer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    referredEmail: {
        type: String,
        required: true,
    },
    referralCode: {
        type: String,
        default: uuidv4, // Generate a unique code by default
        unique: true,
    },
    signupStatus: {
        type: Boolean,
        default: false, // Track if the referred user has signed up
    },
    rewardStatus: {
        type: Boolean,
        default: false, // Track if the referrer has been rewarded
    },
    used: { // Track if the referral code has been used for signup
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;