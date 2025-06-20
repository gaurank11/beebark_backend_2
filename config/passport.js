// passport.js
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const User = require('../models/User'); // Your User model

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser((id, done) => User.findById(id).then(u => done(null, u)));

/* ---------- GOOGLE ---------- */
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    // Use the full absolute callback URL from environment variables
    callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    // If you are using Google to handle state, ensure it matches
    // This is optional if Passport handles it, but good to know
    // passReqToCallback: true 
}, verifyCallback));

/* ---------- FACEBOOK ---------- */
passport.use(new FacebookStrategy({
    clientID: process.env.FB_APP_ID,
    clientSecret: process.env.FB_APP_SECRET,
    // Use the full absolute callback URL from environment variables
    callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
    profileFields: ['id', 'displayName', 'emails', 'name', 'picture.type(large)'],
}, verifyCallback));

/* ---------- SHARED VERIFY CALLBACK FUNCTION ---------- */
async function verifyCallback(accessToken, _refreshToken, profile, done) {
    try {
        const provider = profile.provider; // 'google' | 'facebook'
        const providerId = profile.id;
        const email = profile.emails?.[0]?.value;

        let user = await User.findOne({ provider, providerId });

        if (!user) {
            if (!email) {
                // Handle cases where email is not provided by social login (e.g., restricted access)
                return done(new Error(`No email provided by ${provider} for user ID ${providerId}`), null);
            }

            console.log(`Creating new user for ${provider} with ID: ${providerId} and email: ${email}`);

            const firstName = profile.name?.givenName || '';
            const lastName = profile.name?.familyName || '';
            const fullName = profile.displayName || `${firstName} ${lastName}`.trim() || email;

            user = await User.create({
                firstname: firstName,
                lastname: lastName,
                name: fullName,
                email: email,
                password: undefined, // Social users don't have local passwords
                provider: provider,
                providerId: providerId,
                isVerified: true, // Social logins are considered verified

                // Set default values for other required fields if your User model requires them
                // Adjust these as per your actual User model schema
                phone: '',
                countryCode: '',
                address: '',
                country: '',
                state: '',
                city: '',
                pincode: '',
                category: 'Individual', // Default category
                profileType: 'Individual', // Default profile type
            });
            console.log('New social user created:', user.email);
        } else {
            console.log(`Existing user logged in via ${provider}: ${user.email}`);
        }

        return done(null, user);
    } catch (err) {
        console.error(`Error in verifyCallback for ${profile.provider} (ID: ${profile.id}):`, err);
        return done(err, null);
    }
}

module.exports = passport;