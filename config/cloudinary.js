const cloudinary = require('cloudinary').v2;

// Function to configure Cloudinary
const connectCloudinary = async () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY,
  });
};

// Call the function to configure Cloudinary


module.exports = connectCloudinary;
