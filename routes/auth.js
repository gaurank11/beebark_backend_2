// auth.js
const router = require('express').Router();
const passport = require('../config/passport');
const jwt = require('jsonwebtoken');

/* STEP 1 – kick off the redirect */
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/facebook', passport.authenticate('facebook', { scope: ['email', 'public_profile'] }));
// router.get('/apple', passport.authenticate('apple')); // Removed

/* STEP 2 – providers bounce back here */
router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login?social=google-fail' }),
    issueJwtAndRedirect);

router.get('/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/login?social=facebook-fail' }),
    issueJwtAndRedirect);

// router.post('/apple/callback', // Removed
//     passport.authenticate('apple', { failureRedirect: '/login?social=apple-fail' }),
//     issueJwtAndRedirect);

/* Helper */
function issueJwtAndRedirect(req, res) {
    const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    req.logout(() => { });
    res.redirect(`${process.env.CLIENT_URL}/oauth/success?token=${token}`);
}

module.exports = router;