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
const authRoutes = require('./routes/authRoutes');       // Traditional authentication routes (register, login, etc.)
const socialAuthRoutes = require('./routes/auth');              // Social authentication routes (Google, Facebook Passport strategies)
const otpRoutes = require('./routes/otpRoutes');         // OTP related routes

// Initialize Express app
const app = express();

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
// Mount general authentication routes (register, login, etc.)
app.use('/api/auth', authRoutes);

// Mount social authentication routes (Google, Facebook login/callback)
// These will also be prefixed with /api/auth, so paths like /api/auth/google, /api/auth/google/callback
app.use('/api/auth', socialAuthRoutes);

// Mount user-related API routes
app.use('/api/users', userRoutes);

// Mount OTP related routes
app.use('/api/otp', otpRoutes);

// Route for the root URL to confirm backend is running (health check)
// This should come BEFORE the 404 handler.
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Beebark Backend API is running successfully!' });
});

/*
 * Error Handling / Fallback Routes
 * These should be placed after all specific routes.
 */
// Handle 404 Not Found routes - This MUST be the last route handler before the global error handler
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
 * Database Connection for Vercel Serverless Functions
 * Mongoose connects here, but the app does NOT listen on a port.
 * Vercel's runtime environment will manage the HTTP server.
 */
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB (Vercel Serverless Context)');
    })
    .catch((error) => {
        console.error('MongoDB Connection Error:', error.message);
        // Exit the process if database connection fails, critical for serverless
        process.exit(1);
    });

// EXPORT the Express app instance for Vercel to use
module.exports = app;