const express = require('express');
const { getUserProfile, updateUserProfile, referFriend } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { upload } = require('../middleware/multer');   // Import your multer middleware

const router = express.Router();

// Basic, unprotected route for getting user profile (requires userId in query)
router.get('/get-profile', getUserProfile);

// Protected User Profile Routes (excluding /get-profile)
router.post(
    '/update-profile',
    protect, // ✅ Add this
    upload.fields([
      { name: 'profilePhoto', maxCount: 1 },
      { name: 'coverImage', maxCount: 1 },
      { name: 'businessLogo', maxCount: 1 },
    ]),
    updateUserProfile
  );
  

// Protected Refer a Friend Route
router.post('/refer', referFriend);

module.exports = router;