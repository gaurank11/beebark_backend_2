const multer = require('multer');

// Set up the storage for multer
const storage = multer.diskStorage({
  filename: function (req, file, callback) {
    callback(null, file.originalname);
  }
});

// Create multer instance for handling single or multiple file uploads
const upload = multer({ storage });

// Export the multer instance
module.exports = { upload };
