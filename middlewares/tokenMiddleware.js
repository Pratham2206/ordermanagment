require('dotenv').config();
const jwt = require('jsonwebtoken');
const Token = require('../models/token'); // Import the Token model

const checkTokenBlacklist = async (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1]; 
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }
    try {
        // Decode the token to get expiration time
        const decoded = jwt.decode(token);
        const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

        if (decoded.exp < currentTime) {
            // Token is expired, save it to the database
            await Token.create({
                token,
                userId: null, // You might not have userId here, set to null
                expiresAt: new Date(decoded.exp * 1000), // Convert to Date object
                isBlacklisted: true, // Mark as blacklisted
            });

            return res.status(403).json({ message: 'Token has expired and is now blacklisted' });
        }

        // If token is not expired, verify it
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        req.user = verified; // Store user info in the request object

        // Check if the token is blacklisted in the database
        const isBlacklisted = await Token.findOne({ where: { token } });
        if (isBlacklisted) {
            return res.status(403).json({ message: 'Token is blacklisted' });
        }

        next(); // Proceed to the next middleware
    } catch (err) {
        console.error('Error checking token blacklist:', err);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = checkTokenBlacklist; // Export the middleware function
