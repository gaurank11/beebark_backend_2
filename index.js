// index.js
// This file is ONLY for running the backend locally.

const dotenv = require('dotenv');
dotenv.config(); // Ensure environment variables are loaded for local execution

const app = require('./server'); // Import the Express app instance from server.js
const mongoose = require('mongoose'); // Import mongoose to ensure connection logic runs locally

const PORT = process.env.PORT || 5000; // Define PORT for local listening

// Connect to MongoDB and then start the server for local development
mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected Locally');
        app.listen(PORT, () => {
            console.log(`Server running locally on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('MongoDB Connection Error:', error.message);
        process.exit(1);
    });
