// auth.js
const router = require('express').Router();
const passport = require('../config/passport'); // Path to your passport config
const jwt = require('jsonwebtoken');

/* STEP 1 – kick off the redirect */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));

/* STEP 2 – providers bounce back here */
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: `${process.env.CLIENT_URL}/login?social=google-fail` }),
    issueJwtAndRedirect);

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: `${process.env.CLIENT_URL}/login?social=facebook-fail` }),
    issueJwtAndRedirect);

/* Helper to issue JWT and redirect to frontend */
function issueJwtAndRedirect(req, res) {
    if (!req.user || !req.user._id) {
        console.error("No user found in req.user after social authentication.");
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
    }
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    // Passport's logout method removes the session; useful if not using JWTs primarily for session.
    // For JWTs, this might not be strictly necessary, but good practice to clear server-side session.
    req.logout((err) => {
        if (err) {
            console.error("Error logging out Passport session:", err);
            // Even if logout fails, proceed with JWT redirect as user is authenticated via token
        }
        res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
    });
}

module.exports = router;