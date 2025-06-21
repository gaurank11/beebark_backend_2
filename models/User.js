// // user.js
// const mongoose = require('mongoose');

// const workHistorySchema = new mongoose.Schema({
//     name: String,
//     role: String,
//     duration: String,
// });

// const testimonialSchema = new mongoose.Schema({
//     clientName: String,
//     message: String,
//     date: Date,
// });

// const awardSchema = new mongoose.Schema({
//     title: String,
//     organization: String,
//     year: Number,
//     description: String,
// });

// const projectSchema = new mongoose.Schema({
//     title: String,
//     type: String, // e.g., "Residential", "Commercial"
//     yearStatus: {
//         type: String, // e.g., "Completed", "In Progress"
//     },
//     location: String,
//     budgetRange: String,
//     roleInProject: String,
//     projectLink: String,
// });

// const teamMemberSchema = new mongoose.Schema({
//     name: String,
//     role: String,
//     bio: String,
//     linkedProfileId: String,
// });

// const userSchema = mongoose.Schema({
//     // Basic Info
//     firstname: { type: String, required: true },
//     lastname: { type: String, required: true },
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: false }, // MADE OPTIONAL for social logins

//     // Social Login Specific Fields
//     provider: { type: String },         // 'google', 'facebook'
//     providerId: { type: String },      // Unique ID from the social provider

//     // Contact Info
//     phone: { type: String, required: false, default: '' },
//     phoneBusiness: { type: String },
//     countryCode: { type: String, required: false, default: '' },
//     address: { type: String, default: '' },
//     country: { type: String, default: '' },
//     state: { type: String, default: '' },
//     city: { type: String, default: '' },
//     pincode: { type: String, default: '' },

//     // Professional Info
//     category: { type: String, required: false, default: 'Individual' },
//     otherCategory: { type: String },
//     profilePhoto: {
//         type: String,
//         default: 'https://res.cloudinary.com/dx35apf2r/image/upload/v1747476185/default_profile_pic_url_uqcruc.png',
//     },
//     coverImage: {
//         type: String,
//         default: 'https://res.cloudinary.com/dx35apf2r/image/upload/v1747476185/default_cover_image_url.png',
//     },
//     profileType: {
//         type: String,
//         enum: ['Individual', 'Firm'],
//         default: 'Individual',
//     },
//     isVerified: {
//         type: Boolean,
//         default: false,
//     },
//     establishmentYear: {
//         type: Number,
//     },
//     businessLogo: String,
//     bio: String,

//     // Social Links
//     facebook: String,
//     twitter: String,
//     linkedin: String,
//     website: String,

//     // Experience & Clients
//     yearOfExperience: Number,
//     licenseNumber: String,
//     languageSpoken: [String],
//     workHistory: [workHistorySchema],
//     testimonials: [testimonialSchema],
//     awards: [awardSchema],

//     // Projects / Portfolio
//     projects: [projectSchema],

//     // Collaboration / Hiring Preferences
//     isOpenToFreelance: { type: Boolean },
//     availability: {
//         fullTime: { type: Boolean },
//         partTime: { type: Boolean },
//     },
//     openToCollaboration: { type: Boolean },
//     openToHiringOrInternship: { type: Boolean },

//     // Certifications & Associations
//     certifications: [String],
//     associations: [String],

//     // Team Members
//     teamMembers: [teamMemberSchema],
// }, {
//     timestamps: true,
// });

// // Pre-save hook to set the 'name' field and ensure isVerified for social logins
// userSchema.pre('save', function(next) {
//     if (this.firstname && this.lastname && !this.name) {
//         this.name = `${this.firstname} ${this.lastname}`;
//     }
//     // If user is from a social provider, set isVerified to true and password to undefined
//     if (this.provider && !this.isModified('isVerified')) {
//         this.isVerified = true;
//         this.password = undefined; // Ensure password is not stored for social logins
//     }
//     next();
// });

// const User = mongoose.model('User', userSchema);

// module.exports = User;

const mongoose = require('mongoose');

const workHistorySchema = new mongoose.Schema({
    name: String,
    role: String,
    duration: String,
});

const testimonialSchema = new mongoose.Schema({
    clientName: String,
    message: String,
    date: Date,
});

const awardSchema = new mongoose.Schema({
    title: String,
    organization: String,
    year: Number,
    description: String,
});

const projectSchema = new mongoose.Schema({
    title: String,
    type: String,
    yearStatus: {
        type: String, // e.g., "Completed", "In Progress"
    },
    location: String,
    budgetRange: String,
    roleInProject: String,
    projectLink: String,
});

const teamMemberSchema = new mongoose.Schema({
    name: String,
    role: String,
    bio: String,
    linkedProfileId: String,
    
});

const userSchema = mongoose.Schema({
    // Basic Info
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },

    // Contact Info
    phone: { type: String, required: true },
    phoneBusiness: { type: String },
    countryCode: { type: String, required: true },
    // contact
        address: String,
        country: String,
        state: String,
        city: String,
        pincode: String,


    // Professional Info
    category: { type: String, required: true },
    otherCategory: { type: String },
    profilePhoto: {
        type: String,
        default: 'https://res.cloudinary.com/dx35apf2r/image/upload/v1747476185/default_profile_pic_url_uqcruc.png',
    },
    coverImage: {
        type: String,
        default: 'default_cover_image_url',
    },
    profileType: {
        type: String,
        enum: ['Individual', 'Firm'],
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    establishmentYear: {
        type: Number,
    },
    businessLogo: String,
    bio: String,

    // Social
        facebook: String,
        twitter: String,
        linkedin: String,
        website: String,


    // Experience & Clients
    yearOfExperience: Number,
    licenseNumber: String,
    languageSpoken: [String],
    workHistory: [workHistorySchema],
    testimonials: [testimonialSchema],
    awards: [awardSchema],

    // Projects / Portfolio
    projects: [projectSchema],

    // Collaboration / Hiring Preferences
    isOpenToFreelance: { type: Boolean },
    availability: {
        fullTime: { type: Boolean },
        partTime: { type: Boolean },
    },
    openToCollaboration: { type: Boolean },
    openToHiringOrInternship: { type: Boolean },

    // Certifications & Associations
    certifications: [String],
    associations: [String],

    // Team Members
    teamMembers: [teamMemberSchema],
}, {
    timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;