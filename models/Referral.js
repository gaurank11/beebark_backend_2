const mongoose = require('mongoose');

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
  rewardStatus: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

const Referral = mongoose.model('Referral', referralSchema);

module.exports = Referral;
