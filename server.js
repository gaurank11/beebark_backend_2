// server.js

// Load environment variables from .env file
const dotenv = require('dotenv');
dotenv.config();

// Core Express and Mongoose imports
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Authentication-related imports
const session = require('express-session'); // For session management, essential for Passport.js
const passport = require('./config/passport'); // Your Passport.js configuration

// Other custom configurations and routes
const connectCloudinary = require('./config/cloudinary'); // Assuming this connects to Cloudinary
const userRoutes = require('./routes/userRoutes');       // User-related API routes
const authRoutes = require('./routes/authRoutes');       // Authentication routes (including social login)
const otpRoutes = require('./routes/otpRoutes');         // OTP related routes

// Initialize Express app
const app = express();

// Set the port for the server
const PORT = process.env.PORT || 5000;

// Connect to Cloudinary (assuming this function initializes Cloudinary config)
connectCloudinary();

/*
 * Passport.js and Session Setup
 * These middleware are crucial for handling social logins and maintaining user sessions.
 * express-session should be used before passport.initialize() and passport.session().
 */
app.use(session({
    secret: process.env.SESSION_SECRET, // A strong secret for signing the session ID cookie
    resave: false,                      // Don't save session if unmodified
    saveUninitialized: false,           // Don't save new sessions that have not been modified
    cookie: {                           // Configure session cookie properties (optional but recommended)
        httpOnly: true,                 // Prevents client-side JS from accessing the cookie
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production (HTTPS)
        maxAge: 24 * 60 * 60 * 1000     // Session max age (e.g., 24 hours)
    }
}));

// Initialize Passport
app.use(passport.initialize());

// Enable Passport session support (for persistent login sessions)
app.use(passport.session());

/*
 * General Middleware
 * These middleware are applied to all incoming requests.
 */
// Enable CORS (Cross-Origin Resource Sharing) for your frontend application
// This allows your frontend (e.g., running on localhost:3000) to make requests to this backend
app.use(cors({
    origin: process.env.CLIENT_URL, // Allow requests only from your frontend URL
    credentials: true,              // Allow cookies (sessions) to be sent cross-origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed HTTP methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allowed request headers
}));

// Parse incoming request bodies in JSON format
app.use(express.json());

/*
 * API Routes
 * Mount your route handlers at specific base paths.
 */
app.use('/api/auth', authRoutes); // Handles authentication (login, register, social logins)
app.use('/api/users', userRoutes); // Handles user profile management, referrals, etc.
app.use('/api/otp', otpRoutes);   // Handles OTP generation and verification

/*
 * Error Handling / Fallback Routes
 * These should be placed after all specific routes.
 */
// Handle 404 Not Found routes
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// Global error handler (optional, but good practice for uncaught errors)
app.use((err, req, res, next) => {
    console.error(err.stack); // Log the error stack for debugging
    res.status(err.statusCode || 500).json({
        message: err.message || 'Something went wrong!',
        error: process.env.NODE_ENV === 'production' ? {} : err.stack // Send stack only in dev
    });
});

/*
 * Database Connection and Server Start
 * Connect to MongoDB and then start the Express server.
 */
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        // Start the server only after successful database connection
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB Connection Error:', error.message);
        // Exit the process if database connection fails
        process.exit(1);
    });
